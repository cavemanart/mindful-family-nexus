
import React, { useState } from "react";
import { Target, Plus, Check, Edit, Trash2, Share, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PersonalGoal } from "@/hooks/usePersonalGoals";

interface PersonalGoalsSectionProps {
  personalGoals: PersonalGoal[];
  loading: boolean;
  addPersonalGoal: (data: {
    title: string;
    description: string;
    created_by_name: string;
    completed: boolean;
    is_shared_with_family: boolean;
    target_date?: string;
  }) => Promise<boolean>;
  updatePersonalGoal: (id: string, updates: Partial<PersonalGoal>) => Promise<boolean>;
  deletePersonalGoal: (id: string) => Promise<boolean>;
  currentUserName: string;
  currentUserId: string;
}

const PersonalGoalsSection: React.FC<PersonalGoalsSectionProps> = ({
  personalGoals,
  loading,
  addPersonalGoal,
  updatePersonalGoal,
  deletePersonalGoal,
  currentUserName,
  currentUserId,
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    is_shared_with_family: false,
    target_date: ""
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    is_shared_with_family: false,
    target_date: ""
  });

  const handleAddGoal = async () => {
    if (newGoal.title.trim()) {
      const success = await addPersonalGoal({
        ...newGoal,
        created_by_name: currentUserName,
        completed: false,
        target_date: newGoal.target_date || undefined
      });
      if (success) {
        setNewGoal({ title: '', description: '', is_shared_with_family: false, target_date: '' });
        setIsAddingGoal(false);
      }
    }
  };

  const onEditClick = (goal: PersonalGoal) => {
    setEditingId(goal.id);
    setEditData({
      title: goal.title,
      description: goal.description,
      is_shared_with_family: goal.is_shared_with_family,
      target_date: goal.target_date || ""
    });
  };

  const handleEditSave = async (id: string) => {
    if (editData.title.trim()) {
      const success = await updatePersonalGoal(id, {
        ...editData,
        target_date: editData.target_date || null
      });
      if (success) {
        setEditingId(null);
      }
    }
  };

  const toggleCompleted = async (goal: PersonalGoal) => {
    await updatePersonalGoal(goal.id, { completed: !goal.completed });
  };

  const toggleSharing = async (goal: PersonalGoal) => {
    await updatePersonalGoal(goal.id, { is_shared_with_family: !goal.is_shared_with_family });
  };

  // Filter goals to show user's own goals
  const myGoals = personalGoals.filter(goal => goal.created_by === currentUserId);
  const sharedGoals = personalGoals.filter(goal => 
    goal.created_by !== currentUserId && goal.is_shared_with_family
  );

  return (
    <div className="space-y-6">
      {/* My Personal Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="text-purple-500" size={24} />
            My Personal Goals
          </h3>
          <Button 
            onClick={() => setIsAddingGoal(true)} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus size={16} className="mr-2" />
            Add Personal Goal
          </Button>
        </div>

        {isAddingGoal && (
          <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-purple-800">Create Your Personal Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What do you want to achieve?"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              />
              <Textarea
                placeholder="Describe your goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                rows={3}
              />
              <Input
                type="date"
                placeholder="Target date (optional)"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={newGoal.is_shared_with_family}
                  onCheckedChange={(checked) => setNewGoal({ ...newGoal, is_shared_with_family: checked })}
                />
                <label className="text-sm">Share with family</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddGoal} className="bg-purple-600 hover:bg-purple-700">
                  <Target size={16} className="mr-2" />
                  Create Goal
                </Button>
                <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {myGoals.map((goal) => (
            <Card key={goal.id} className={`${
              goal.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-purple-50 border-purple-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCompleted(goal)}
                      className={`mt-1 ${
                        goal.completed ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      <Check size={20} />
                    </Button>
                    <div className="flex-1">
                      {editingId === goal.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          />
                          <Textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            rows={2}
                          />
                          <Input
                            type="date"
                            value={editData.target_date}
                            onChange={(e) => setEditData({ ...editData, target_date: e.target.value })}
                          />
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editData.is_shared_with_family}
                              onCheckedChange={(checked) => setEditData({ ...editData, is_shared_with_family: checked })}
                            />
                            <label className="text-sm">Share with family</label>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button onClick={() => handleEditSave(goal.id)} size="sm">
                              Save
                            </Button>
                            <Button variant="outline" onClick={() => setEditingId(null)} size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className={`font-semibold ${
                            goal.completed ? 'text-green-800 line-through' : 'text-foreground'
                          }`}>
                            {goal.title}
                          </h4>
                          <p className={`text-sm ${
                            goal.completed ? 'text-green-700' : 'text-foreground'
                          }`}>
                            {goal.description}
                          </p>
                          {goal.target_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Target: {new Date(goal.target_date).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-2">
                    <div className="flex items-center gap-1">
                      <Badge variant={goal.completed ? "default" : "secondary"}>
                        {goal.completed ? 'Completed' : 'In Progress'}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleSharing(goal)}
                        className="h-6 w-6"
                      >
                        {goal.is_shared_with_family ? (
                          <Eye className="w-3 h-3 text-blue-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {editingId !== goal.id && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => onEditClick(goal)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deletePersonalGoal(goal.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {myGoals.length === 0 && (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-6 text-center">
                <Target className="text-gray-300 mx-auto mb-2" size={32} />
                <p className="text-muted-foreground">No personal goals yet. Create your first goal!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Family Shared Goals */}
      {sharedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Share className="text-blue-500" size={20} />
            Family Shared Goals
          </h3>
          <div className="grid gap-4">
            {sharedGoals.map((goal) => (
              <Card key={goal.id} className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        goal.completed ? 'text-blue-800 line-through' : 'text-blue-900'
                      }`}>
                        {goal.title}
                      </h4>
                      <p className="text-sm text-blue-700 mb-1">
                        by {goal.created_by_name}
                      </p>
                      <p className="text-sm text-blue-600">{goal.description}</p>
                    </div>
                    <Badge variant={goal.completed ? "default" : "secondary"}>
                      {goal.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalGoalsSection;
