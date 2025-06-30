
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Star, Trophy, AlertCircle } from 'lucide-react';
import { useChores } from '@/hooks/useChores';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChildren } from '@/hooks/useChildren';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChoreBoardProps {
  householdId: string;
  childId?: string;
  isParentView?: boolean;
}

export default function ChoreBoard({ householdId, childId, isParentView = false }: ChoreBoardProps) {
  const { chores, loading: choresLoading, refetch: refetchChores } = useChores(householdId);
  const { submitChoreForApproval, getChildPoints, approveChoreSubmission, rejectChoreSubmission, choreSubmissions } = useChorePoints(householdId);
  const { children } = useChildren(householdId);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  // Improved filtering logic
  const filteredChores = React.useMemo(() => {
    if (!childId) return chores;
    
    const selectedChild = children.find(c => c.id === childId);
    if (!selectedChild) return [];
    
    // Match by full name, first name, or child ID
    const childName = selectedChild.first_name;
    const fullName = `${selectedChild.first_name} ${selectedChild.last_name || ''}`.trim();
    
    return chores.filter(chore => {
      const assignedTo = chore.assigned_to.toLowerCase();
      return assignedTo === childName.toLowerCase() || 
             assignedTo === fullName.toLowerCase() ||
             assignedTo === childId;
    });
  }, [chores, childId, children]);

  const childPoints = childId ? getChildPoints(childId) : null;

  const handleSubmitChore = async (choreId: string) => {
    if (!childId) return;
    
    const success = await submitChoreForApproval(choreId, childId);
    if (success) {
      toast({
        title: "Success!",
        description: "Your chore has been submitted for approval! 🎉",
      });
      refetchChores(); // Refresh chores to show updated status
    }
  };

  const handleApproveChore = async (choreId: string) => {
    if (!isParentView) return;
    
    // Find the submission for this chore
    const submission = choreSubmissions.find(s => s.chore_id === choreId && s.status === 'pending');
    if (!submission) return;

    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    const success = await approveChoreSubmission(submission.id, chore.points);
    if (success) {
      toast({
        title: "Chore Approved!",
        description: `${chore.points} points awarded! 🌟`,
      });
      refetchChores();
    }
  };

  const handleRejectChore = async (choreId: string, reason?: string) => {
    if (!isParentView) return;
    
    // Find the submission for this chore
    const submission = choreSubmissions.find(s => s.chore_id === choreId && s.status === 'pending');
    if (!submission) return;

    const success = await rejectChoreSubmission(submission.id, reason);
    if (success) {
      toast({
        title: "Chore Needs Revision",
        description: "Child has been notified.",
      });
      refetchChores();
    }
  };

  const getChoreStatusColor = (chore: any) => {
    if (chore.approval_status === 'approved') return 'bg-green-100 dark:bg-green-950/30 border-green-300 dark:border-green-700';
    if (chore.approval_status === 'pending') return 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700';
    if (chore.approval_status === 'rejected') return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700';
    return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';
  };

  const getStatusIcon = (chore: any) => {
    if (chore.approval_status === 'approved') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (chore.approval_status === 'pending') return <Clock className="h-5 w-5 text-yellow-600" />;
    if (chore.approval_status === 'rejected') return <AlertCircle className="h-5 w-5 text-red-600" />;
    return null;
  };

  const getChildName = (assignedTo: string) => {
    // First try to find by ID
    const childById = children.find(child => child.id === assignedTo);
    if (childById) return childById.first_name;

    // Then try to find by name
    const childByName = children.find(child => 
      child.first_name.toLowerCase() === assignedTo.toLowerCase() ||
      `${child.first_name} ${child.last_name || ''}`.trim().toLowerCase() === assignedTo.toLowerCase()
    );
    if (childByName) return childByName.first_name;

    // For child view, if it's assigned to current user, return "Me"
    if (!isParentView && userProfile && (
      assignedTo === userProfile.id || 
      assignedTo.toLowerCase() === userProfile.first_name?.toLowerCase() ||
      assignedTo.toLowerCase() === `${userProfile.first_name} ${userProfile.last_name || ''}`.trim().toLowerCase()
    )) {
      return 'Me';
    }

    // If still not found, return the original assigned_to value
    return assignedTo;
  };

  const getActionButton = (chore: any) => {
    if (isParentView) {
      // Parent view - show approval/rejection options for pending chores
      if (chore.approval_status === 'pending') {
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => handleApproveChore(chore.id)}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve & Award Points
            </Button>
            <Button 
              onClick={() => handleRejectChore(chore.id, "Please try again")}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700"
              size="sm"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Needs Revision
            </Button>
          </div>
        );
      }
      return null; // Parents don't interact with other statuses
    }

    // Child view workflow
    if (chore.approval_status === 'approved') {
      return (
        <Badge variant="default" className="w-full justify-center bg-green-600 text-white">
          ✅ Completed & Points Earned!
        </Badge>
      );
    }

    if (chore.approval_status === 'pending') {
      return (
        <Badge variant="secondary" className="w-full justify-center bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">
          ⏳ Waiting for Approval
        </Badge>
      );
    }

    if (chore.approval_status === 'rejected') {
      return (
        <div className="space-y-2">
          <Badge variant="destructive" className="w-full justify-center">
            ❌ Needs Revision
          </Badge>
          <Button 
            onClick={() => handleSubmitChore(chore.id)}
            className="w-full"
            size="sm"
          >
            Mark as Complete
          </Button>
        </div>
      );
    }

    // Default state - not submitted yet
    return (
      <Button 
        onClick={() => handleSubmitChore(chore.id)}
        className="w-full"
        size="sm"
      >
        Mark as Complete
      </Button>
    );
  };

  if (choresLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Display for Child View */}
      {childId && childPoints && !isParentView && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Your Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{childPoints.total_points}</div>
                <div className="text-sm opacity-90">Level {childPoints.level}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Streak</div>
                <div className="text-2xl font-bold">{childPoints.streak_days} days</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm opacity-90 mb-2">Progress to Level {childPoints.level + 1}</div>
              <Progress 
                value={(childPoints.total_points % 100)} 
                className="h-2 bg-white/20"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChores.map((chore) => (
          <Card key={chore.id} className={`${getChoreStatusColor(chore)} transition-all hover:shadow-md border`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-foreground">{chore.title}</CardTitle>
                {getStatusIcon(chore)}
              </div>
              <CardDescription className="text-muted-foreground">{chore.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {chore.points} points
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Due: {new Date(chore.due_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Assigned to: {getChildName(chore.assigned_to)}
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  {getActionButton(chore)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChores.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              {childId ? "No chores assigned yet!" : "No chores found."}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
