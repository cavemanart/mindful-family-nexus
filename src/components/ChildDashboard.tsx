
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useChores } from '@/hooks/useChores';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { useMVPOfTheDay } from '@/hooks/useMVPOfTheDay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Trophy, Calendar, Heart, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChildDashboardProps {
  selectedHousehold?: Household | null;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { chores, toggleChore } = useChores(selectedHousehold?.id);
  const { wins, goals } = useWeeklyData(selectedHousehold?.id || null);
  const { todaysMVP } = useMVPOfTheDay(selectedHousehold?.id);

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

  const myChores = chores.filter(chore => 
    chore.assigned_to.toLowerCase() === userProfile?.first_name?.toLowerCase() ||
    chore.assigned_to.toLowerCase() === (userProfile?.first_name + ' ' + userProfile?.last_name)?.toLowerCase()
  );

  const completedChores = myChores.filter(chore => chore.completed);
  const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center py-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Hi {userProfile?.first_name || 'Kiddo'}! 🌟
        </h1>
        <p className="text-muted-foreground text-xl">
          Let's see what you can do today!
        </p>
      </div>

      {/* Points Summary */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Your Points: {totalPoints}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-muted-foreground">
              You've completed {completedChores.length} out of {myChores.length} tasks!
            </p>
            {completedChores.length === myChores.length && myChores.length > 0 && (
              <p className="text-green-600 font-semibold mt-2">🎉 All done! Great job!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Chores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myChores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-lg">No tasks assigned yet!</p>
                <p className="text-muted-foreground">Check back later for new tasks.</p>
              </div>
            ) : (
              myChores.map((chore) => (
                <div key={chore.id} className={`border rounded-lg p-4 ${chore.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${chore.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                        {chore.title}
                      </h3>
                      <p className={`text-sm ${chore.completed ? 'text-green-600' : 'text-gray-600'}`}>
                        {chore.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-yellow-600">
                          <Star className="h-4 w-4" />
                          {chore.points} points
                        </span>
                        <span className="text-sm text-gray-500">
                          Due: {new Date(chore.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant={chore.completed ? "secondary" : "default"}
                      size="lg"
                      onClick={() => toggleChore(chore.id)}
                      className={chore.completed ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                    >
                      {chore.completed ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Done!
                        </>
                      ) : (
                        "Mark Done"
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Family Wins */}
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
              <p className="text-center text-muted-foreground py-4">No wins shared yet this week!</p>
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

      {/* Family Goals */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Family Goals This Week 🎯
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No goals set yet this week!</p>
            ) : (
              goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className={`rounded-lg p-3 border ${goal.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <CheckCircle className={`h-4 w-4 mt-1 flex-shrink-0 ${goal.completed ? 'text-green-500' : 'text-gray-300'}`} />
                      <div>
                        <h4 className={`font-medium text-sm ${goal.completed ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                          {goal.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">for {goal.assigned_to}</p>
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

      {/* Today's MVP */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Today's MVP 🏅
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!todaysMVP ? (
              <p className="text-center text-muted-foreground py-4">No MVP nominated yet today!</p>
            ) : (
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-center">
                  <div className="text-2xl mb-2">{todaysMVP.emoji}</div>
                  <h3 className="font-bold text-lg text-foreground">{todaysMVP.nominated_for}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Nominated by {todaysMVP.nominated_by}</p>
                  <p className="italic text-foreground">"{todaysMVP.reason}"</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildDashboard;
