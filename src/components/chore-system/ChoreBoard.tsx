
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Star, Trophy, Trash2 } from 'lucide-react';
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
  const { chores, loading: choresLoading, toggleChore, deleteChore, refetch: refetchChores } = useChores(householdId);
  const { addPointsToChild, getChildPoints, refetch: refetchPoints } = useChorePoints(householdId);
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

  const handleToggleChore = async (choreId: string) => {
    const success = await toggleChore(choreId);
    if (success) {
      const chore = chores.find(c => c.id === choreId);
      if (chore && !chore.completed) {
        toast({
          title: "Chore Completed!",
          description: `Great job completing "${chore.title}"! 🎉`,
        });
      }
      refetchChores();
    }
  };

  const handleAwardPoints = async (choreId: string) => {
    if (!isParentView) return;
    
    const chore = chores.find(c => c.id === choreId);
    if (!chore) return;

    // Find the child ID from the assigned_to field
    const assignedChild = children.find(child => 
      child.first_name.toLowerCase() === chore.assigned_to.toLowerCase() ||
      `${child.first_name} ${child.last_name || ''}`.trim().toLowerCase() === chore.assigned_to.toLowerCase() ||
      child.id === chore.assigned_to
    );

    if (!assignedChild) {
      toast({
        title: "Error",
        description: "Could not find the assigned child",
        variant: "destructive"
      });
      return;
    }

    const success = await addPointsToChild(
      assignedChild.id, 
      chore.points, 
      'chore_completion', 
      `Completed chore: ${chore.title}`,
      choreId
    );

    if (success) {
      toast({
        title: "Points Awarded!",
        description: `${chore.points} points awarded to ${assignedChild.first_name}! 🌟`,
      });
      
      // Refresh both chores and points
      refetchChores();
      refetchPoints();
    }
  };

  const handleDeleteChore = async (choreId: string) => {
    const success = await deleteChore(choreId);
    if (success) {
      refetchChores();
    }
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
      // Parent view - show different states
      if (chore.completed) {
        // Check if points were already awarded by looking for a transaction
        const hasBeenAwarded = chore.points_awarded || false; // We'll need to track this
        
        return (
          <div className="space-y-2">
            <Button 
              onClick={() => handleAwardPoints(chore.id)}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
              disabled={hasBeenAwarded}
            >
              <Star className="h-4 w-4 mr-1" />
              {hasBeenAwarded ? 'Points Awarded' : `Award ${chore.points} Points`}
            </Button>
            
            {chore.completed && (
              <Button 
                onClick={() => handleDeleteChore(chore.id)}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        );
      }
      return (
        <Badge variant="secondary" className="w-full justify-center">
          Waiting for completion
        </Badge>
      );
    }

    // Child view - simple toggle
    return (
      <Button 
        onClick={() => handleToggleChore(chore.id)}
        variant={chore.completed ? "outline" : "default"}
        className="w-full"
        size="sm"
      >
        {chore.completed ? (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed!
          </>
        ) : (
          "Mark as Complete"
        )}
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
          <Card key={chore.id} className={`transition-all hover:shadow-md border ${
            chore.completed 
              ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-foreground">{chore.title}</CardTitle>
                {chore.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
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
