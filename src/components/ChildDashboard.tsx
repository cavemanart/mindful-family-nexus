
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Household } from '@/hooks/useHouseholds';
import { useChores } from '@/hooks/useChores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Trophy, Calendar } from 'lucide-react';

interface ChildDashboardProps {
  selectedHousehold?: Household | null;
}

const ChildDashboard: React.FC<ChildDashboardProps> = ({ selectedHousehold }) => {
  const { userProfile } = useAuth();
  const { chores, toggleChore } = useChores(selectedHousehold?.id);

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
    </div>
  );
};

export default ChildDashboard;
