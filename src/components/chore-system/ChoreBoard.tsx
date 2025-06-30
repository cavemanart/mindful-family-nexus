
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Star, Trophy } from 'lucide-react';
import { useChores } from '@/hooks/useChores';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChildren } from '@/hooks/useChildren';

interface ChoreBoardProps {
  householdId: string;
  childId?: string;
  isParentView?: boolean;
}

export default function ChoreBoard({ householdId, childId, isParentView = false }: ChoreBoardProps) {
  const { chores, loading: choresLoading } = useChores(householdId);
  const { submitChoreForApproval, getChildPoints } = useChorePoints(householdId);
  const { children } = useChildren(householdId);

  // Improved filtering logic
  const filteredChores = React.useMemo(() => {
    if (!childId) return chores;
    
    const selectedChild = children.find(c => c.id === childId);
    if (!selectedChild) return [];
    
    // Match by full name, first name, or child ID
    const childName = selectedChild.first_name;
    const fullName = `${selectedChild.first_name} ${selectedChild.last_name}`.trim();
    
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
    await submitChoreForApproval(choreId, childId);
  };

  const getChoreStatusColor = (chore: any) => {
    const approvalStatus = chore.approval_status || (chore.completed ? 'completed' : 'pending');
    
    if (approvalStatus === 'approved') return 'bg-green-100 border-green-300';
    if (approvalStatus === 'pending' && chore.completed) return 'bg-yellow-100 border-yellow-300';
    if (chore.completed) return 'bg-blue-100 border-blue-300';
    return 'bg-white border-gray-200';
  };

  const getStatusIcon = (chore: any) => {
    const approvalStatus = chore.approval_status || (chore.completed ? 'completed' : 'pending');
    
    if (approvalStatus === 'approved') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (approvalStatus === 'pending' && chore.completed) return <Clock className="h-5 w-5 text-yellow-600" />;
    return null;
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
      {childId && childPoints && (
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
          <Card key={chore.id} className={`${getChoreStatusColor(chore)} transition-all hover:shadow-md`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{chore.title}</CardTitle>
                {getStatusIcon(chore)}
              </div>
              <CardDescription>{chore.description}</CardDescription>
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
                  Assigned to: {chore.assigned_to}
                </div>

                {/* Action Buttons */}
                {!isParentView && childId && (
                  <div className="pt-2">
                    {chore.approval_status === 'approved' ? (
                      <Badge variant="default" className="w-full justify-center bg-green-600">
                        ✅ Completed & Approved
                      </Badge>
                    ) : chore.approval_status === 'pending' ? (
                      <Badge variant="secondary" className="w-full justify-center bg-yellow-100 text-yellow-800">
                        ⏳ Waiting for Approval
                      </Badge>
                    ) : chore.completed ? (
                      <Badge variant="outline" className="w-full justify-center">
                        Submitted
                      </Badge>
                    ) : (
                      <Button 
                        onClick={() => handleSubmitChore(chore.id)}
                        className="w-full"
                        size="sm"
                      >
                        Mark as Done
                      </Button>
                    )}
                  </div>
                )}
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
