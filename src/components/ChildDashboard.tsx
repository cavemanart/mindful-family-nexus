
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Trophy, Calendar, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ChoreBoard from '@/components/chore-system/ChoreBoard';

interface ChildDashboardProps {
  selectedHousehold?: Household | null;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { wins, goals, toggleGoal } = useWeeklyData(selectedHousehold?.id || null);
  const { initializeChildPoints, getChildPoints } = useChorePoints(selectedHousehold?.id || null);

  // Initialize child points when component mounts
  useEffect(() => {
    if (userProfile?.id && selectedHousehold?.id && userProfile.is_child_account) {
      initializeChildPoints(userProfile.id);
    }
  }, [userProfile?.id, selectedHousehold?.id, userProfile?.is_child_account, initializeChildPoints]);

  if (!selectedHousehold) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Household Selected</h2>
          <p className="text-muted-foreground">Please select a household to continue</p>
        </div>
      </div>
    );
  }

  // Only show data for the current child user
  const childName = userProfile?.first_name || '';
  const childFullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim();

  // Filter goals specifically for this child only
  const myGoals = goals.filter(goal => {
    const assignedTo = goal.assigned_to.toLowerCase();
    return assignedTo === childName.toLowerCase() || 
           assignedTo === childFullName.toLowerCase();
  });

  const completedGoals = myGoals.filter(goal => goal.completed);
  
  // Get points from the chore system
  const childPoints = userProfile?.id ? getChildPoints(userProfile.id) : null;
  const totalPoints = childPoints?.total_points || 0;

  const getRewardLevel = (points: number) => {
    if (points >= 50) return { level: 'Super Star', color: 'text-purple-600', icon: '🌟' };
    if (points >= 30) return { level: 'Champion', color: 'text-blue-600', icon: '🏆' };
    if (points >= 15) return { level: 'Helper', color: 'text-green-600', icon: '⭐' };
    return { level: 'Getting Started', color: 'text-gray-600', icon: '👍' };
  };

  const reward = getRewardLevel(totalPoints);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center py-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Hi {childName}! 🌟
        </h1>
        <p className="text-muted-foreground text-xl">
          Let's see what you can accomplish today!
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="font-bold text-lg">{totalPoints}</span>
            </div>
            <p className="text-sm text-muted-foreground">Points Earned</p>
            <div className={`text-lg font-semibold ${reward.color} mt-1`}>
              {reward.icon} {reward.level}
            </div>
            {childPoints && (
              <div className="text-sm text-muted-foreground mt-1">
                Level {childPoints.level} • {childPoints.streak_days} day streak
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-green-500" />
              <span className="font-bold text-lg">{completedGoals.length}/{myGoals.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Goals Achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* My Chores Section - Using ChoreBoard Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            My Chores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChoreBoard 
            householdId={selectedHousehold.id} 
            childId={userProfile?.id}
            isParentView={false}
          />
        </CardContent>
      </Card>

      {/* My Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            My Goals This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myGoals.length === 0 ? (
              <div className="text-center py-6">
                <Target className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-muted-foreground">No personal goals set yet!</p>
              </div>
            ) : (
              myGoals.map((goal) => (
                <div key={goal.id} className={`rounded-lg p-3 border ${
                  goal.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`p-1 rounded ${goal.completed ? 'text-green-500' : 'text-gray-300'}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <div>
                        <h4 className={`font-medium text-sm ${
                          goal.completed ? 'text-green-800 line-through' : 'text-gray-800'
                        }`}>
                          {goal.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">{goal.description}</p>
                      </div>
                    </div>
                    <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs">
                      {goal.completed ? 'Done!' : 'In Progress'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Family Wins (Read-only for kids) */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Family Wins This Week 🎉
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wins.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No family wins shared yet this week!</p>
            ) : (
              wins.slice(0, 3).map((win) => (
                <div key={win.id} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-start gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{win.title}</h4>
                      <p className="text-xs text-muted-foreground">by {win.added_by}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildDashboard;
