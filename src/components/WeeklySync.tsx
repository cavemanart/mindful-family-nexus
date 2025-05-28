
import React, { useState } from 'react';
import { Calendar, Trophy, Target, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWeeklyData } from '@/hooks/useWeeklyData';

interface WeeklySyncProps {
  selectedHousehold: { id: string } | null;
}

const WeeklySync = ({ selectedHousehold }: WeeklySyncProps) => {
  const { wins, goals, loading, addWin, addGoal, toggleGoal } = useWeeklyData(selectedHousehold?.id || null);
  
  const [isAddingWin, setIsAddingWin] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  const [newWin, setNewWin] = useState({ title: '', description: '', added_by: '' });
  const [newGoal, setNewGoal] = useState({ title: '', description: '', assigned_to: '' });

  const familyMembers = ['Mom', 'Dad', 'Emma', 'Jack'];

  const handleAddWin = async () => {
    if (newWin.title.trim() && newWin.added_by) {
      const success = await addWin(newWin);
      if (success) {
        setNewWin({ title: '', description: '', added_by: '' });
        setIsAddingWin(false);
      }
    }
  };

  const handleAddGoal = async () => {
    if (newGoal.title.trim() && newGoal.assigned_to) {
      const success = await addGoal({ ...newGoal, completed: false });
      if (success) {
        setNewGoal({ title: '', description: '', assigned_to: '' });
        setIsAddingGoal(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading weekly data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl">
        <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
          <Calendar className="text-blue-500" size={32} />
          Weekly Family Sync
        </h2>
        <p className="text-muted-foreground">Celebrate wins and set goals together</p>
      </div>

      {/* Weekly Wins Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} />
            This Week's Wins
          </h3>
          <Button onClick={() => setIsAddingWin(true)} className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600">
            <Plus size={16} className="mr-2" />
            Add Win
          </Button>
        </div>

        {isAddingWin && (
          <Card className="border-2 border-dashed border-yellow-300 dark:border-yellow-600 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">Share a Family Win</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Win title..."
                value={newWin.title}
                onChange={(e) => setNewWin({ ...newWin, title: e.target.value })}
              />
              <Textarea
                placeholder="Tell us more about this win..."
                value={newWin.description}
                onChange={(e) => setNewWin({ ...newWin, description: e.target.value })}
                rows={3}
              />
              <select
                className="w-full p-2 border rounded-md bg-background text-foreground border-border"
                value={newWin.added_by}
                onChange={(e) => setNewWin({ ...newWin, added_by: e.target.value })}
              >
                <option value="">Who's sharing this win?</option>
                {familyMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddWin} className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600">
                  <Trophy size={16} className="mr-2" />
                  Add Win
                </Button>
                <Button variant="outline" onClick={() => setIsAddingWin(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {wins.map((win) => (
            <Card key={win.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <Trophy size={20} className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{win.title}</h4>
                      <p className="text-sm text-muted-foreground">by {win.added_by}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(win.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-foreground">{win.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="text-blue-500" size={24} />
            This Week's Goals
          </h3>
          <Button onClick={() => setIsAddingGoal(true)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            <Plus size={16} className="mr-2" />
            Add Goal
          </Button>
        </div>

        {isAddingGoal && (
          <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">Set a Family Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Goal title..."
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Describe the goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                rows={3}
              />
              <select
                className="w-full p-2 border rounded-md bg-background text-foreground border-border"
                value={newGoal.assigned_to}
                onChange={(e) => setNewGoal({ ...newGoal, assigned_to: e.target.value })}
              >
                <option value="">Assign to...</option>
                {familyMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddGoal} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  <Target size={16} className="mr-2" />
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className={`${goal.completed ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700' : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGoal(goal.id)}
                      className={`mt-1 ${goal.completed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                    >
                      <Check size={20} />
                    </Button>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${goal.completed ? 'text-green-800 dark:text-green-200 line-through' : 'text-foreground'}`}>
                        {goal.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">Assigned to {goal.assigned_to}</p>
                      <p className={`text-sm ${goal.completed ? 'text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                        {goal.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs">
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklySync;
