
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useChores } from '@/hooks/useChores';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { useFamilyMessages } from '@/hooks/useFamilyMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Trophy, Calendar, Heart, Target, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChildDashboardProps {
  selectedHousehold?: Household | null;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { chores, toggleChore } = useChores(selectedHousehold?.id);
  const { wins, goals } = useWeeklyData(selectedHousehold?.id || null);
  const { messages } = useFamilyMessages(selectedHousehold?.id || null);

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

  // Filter content specifically for this child
  const childName = userProfile?.first_name || '';
  const childFullName = `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim();

  const myChores = chores.filter(chore => 
    chore.assigned_to.toLowerCase() === childName.toLowerCase() ||
    chore.assigned_to.toLowerCase() === childFullName.toLowerCase()
  );

  const myGoals = goals.filter(goal =>
    goal.assigned_to.toLowerCase() === childName.toLowerCase() ||
    goal.assigned_to.toLowerCase() === childFullName.toLowerCase()
  );

  const myMessages = messages.filter(message =>
    message.to_member === null || // General family messages
    message.to_member.toLowerCase() === childName.toLowerCase() ||
    message.to_member.toLowerCase() === childFullName.toLowerCase()
  );

  const completedChores = myChores.filter(chore => chore.completed);
  const completedGoals = myGoals.filter(goal => goal.completed);
  const totalPoints = completedChores.reduce((sum, chore) => sum + chore.points, 0);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-blue-500" />
              <span className="font-bold text-lg">{completedChores.length}/{myChores.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Tasks Completed</p>
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

      {/* My Tasks */}
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
                <Calendar className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-muted-foreground text-lg">No tasks assigned yet!</p>
                <p className="text-muted-foreground">Check back later for new tasks.</p>
              </div>
            ) : (
              myChores.map((chore) => (
                <div key={chore.id} className={`border rounded-lg p-4 ${
                  chore.completed ? 'bg-green-50 border-green-200' : 'bg-white hover:shadow-md transition-shadow'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        chore.completed ? 'text-green-800 line-through' : 'text-gray-800'
                      }`}>
                        {chore.title}
                      </h3>
                      <p className={`text-sm ${
                        chore.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
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
                      <CheckCircle className={`h-4 w-4 mt-1 flex-shrink-0 ${
                        goal.completed ? 'text-green-500' : 'text-gray-300'
                      }`} />
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

      {/* My Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-pink-500" />
            My Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myMessages.length === 0 ? (
              <div className="text-center py-6">
                <Heart className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-muted-foreground">No messages yet!</p>
              </div>
            ) : (
              myMessages.slice(0, 5).map((message) => (
                <div key={message.id} className={`rounded-lg p-3 border ${
                  message.is_special 
                    ? 'bg-pink-50 border-pink-200' 
                    : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">From {message.from_member}</span>
                      {message.is_special && (
                        <Badge className="bg-pink-100 text-pink-600 text-xs">Special</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{message.message}</p>
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
