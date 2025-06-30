
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp } from 'lucide-react';
import { useChorePoints } from '@/hooks/useChorePoints';
import { useChildren } from '@/hooks/useChildren';

interface ChildPointsTrackerProps {
  householdId: string;
}

export default function ChildPointsTracker({ householdId }: ChildPointsTrackerProps) {
  const { childPoints, pointTransactions, loading } = useChorePoints(householdId);
  const { children } = useChildren(householdId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getChildName = (childId: string) => {
    const child = children.find(c => c.id === childId);
    return child ? child.first_name : 'Unknown Child';
  };

  const getRecentTransactions = (childId: string) => {
    return pointTransactions
      .filter(t => t.child_id === childId)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {childPoints.map((points) => {
          const childName = getChildName(points.child_id);
          const recentTransactions = getRecentTransactions(points.child_id);
          
          return (
            <Card key={points.id} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {childName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Points Overview */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{points.total_points}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Level {points.level}
                    </Badge>
                  </div>
                </div>

                {/* Progress to Next Level */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to Level {points.level + 1}</span>
                    <span>{points.total_points % 100}/100</span>
                  </div>
                  <Progress value={points.total_points % 100} className="h-2" />
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{points.streak_days} day streak</span>
                </div>

                {/* Recent Activity */}
                {recentTransactions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-1">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center text-xs">
                          <span className="truncate">{transaction.description}</span>
                          <Badge variant="outline" className="text-xs">
                            +{transaction.points_change}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {childPoints.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No child points data available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Points will appear once children complete their first chores.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
