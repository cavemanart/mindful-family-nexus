
import React, { useState } from "react";
import { Target, Plus, Check, Edit, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { WeeklyGoal } from "@/hooks/useWeeklyData";

interface WeeklyGoalsSectionProps {
  goals: WeeklyGoal[];
  loading: boolean;
  addGoal: (data: { 
    title: string; 
    description: string; 
    assigned_to: string; 
    completed: boolean;
    created_by_name?: string;
    is_assigned_by_parent?: boolean;
  }) => Promise<boolean>;
  toggleGoal: (id: string) => void;
  familyMembers: string[];
  deleteGoal: (id: string) => Promise<boolean>;
  editGoal: (
    id: string,
    data: Partial<Omit<WeeklyGoal, 'id' | 'household_id' | 'created_at' | 'updated_at'>>
  ) => Promise<boolean>;
  currentUserName: string;
  isParent?: boolean;
}

const WeeklyGoalsSection: React.FC<WeeklyGoalsSectionProps> = ({
  goals,
  loading,
  addGoal,
  toggleGoal,
  familyMembers,
  deleteGoal,
  editGoal,
  currentUserName,
  isParent = true,
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    title: "", 
    description: "", 
    assigned_to: "",
    assignToParent: false
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ 
    title: "", 
    description: "", 
    assigned_to: "" 
  });

  const handleAddGoal = async () => {
    if (newGoal.title.trim() && newGoal.assigned_to) {
      const success = await addGoal({ 
        ...newGoal, 
        completed: false,
        created_by_name: currentUserName,
        is_assigned_by_parent: isParent
      });
      if (success) {
        setNewGoal({ title: '', description: '', assigned_to: '', assignToParent: false });
        setIsAddingGoal(false);
      }
    }
  };

  const onEditClick = (goal: WeeklyGoal) => {
    setEditingId(goal.id);
    setEditData({
      title: goal.title,
      description: goal.description,
      assigned_to: goal.assigned_to
    });
  };

  const handleEditSave = async (id: string) => {
    if (editData.title.trim() && editData.assigned_to) {
      const success = await editGoal(id, editData);
      if (success) {
        setEditingId(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="text-blue-500" size={24} />
          {isParent ? "Family Goals & Assignments" : "Assigned Goals"}
        </h3>
        {isParent && (
          <Button onClick={() => setIsAddingGoal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Assign Goal
          </Button>
        )}
      </div>

      {isAddingGoal && isParent && (
        <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Assign a Family Goal</CardTitle>
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newGoal.assignToParent}
                  onCheckedChange={(checked) => {
                    setNewGoal({ 
                      ...newGoal, 
                      assignToParent: checked,
                      assigned_to: checked ? currentUserName : ""
                    });
                  }}
                />
                <label className="text-sm">Assign to myself</label>
              </div>
              {!newGoal.assignToParent && (
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
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddGoal} className="bg-blue-600 hover:bg-blue-700">
                <Target size={16} className="mr-2" />
                Assign Goal
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
          <Card key={goal.id} className={`${
            goal.completed 
              ? 'bg-green-50 border-green-200' 
              : goal.is_assigned_by_parent 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-purple-50 border-purple-200'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGoal(goal.id)}
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
                          placeholder="Goal title..."
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="mb-1"
                        />
                        <Textarea
                          placeholder="Describe the goal..."
                          value={editData.description}
                          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                          rows={2}
                        />
                        {isParent && (
                          <select
                            className="w-full p-2 border rounded-md bg-background text-foreground border-border"
                            value={editData.assigned_to}
                            onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                          >
                            <option value="">Assign to...</option>
                            {familyMembers.map(member => (
                              <option key={member} value={member}>{member}</option>
                            ))}
                          </select>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleEditSave(goal.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${
                            goal.completed ? 'text-green-800 line-through' : 'text-foreground'
                          }`}>
                            {goal.title}
                          </h4>
                          {goal.is_assigned_by_parent && (
                            <UserCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Assigned to {goal.assigned_to}
                          {goal.created_by_name && (
                            <span className="text-xs"> • by {goal.created_by_name}</span>
                          )}
                        </p>
                        <p className={`text-sm ${
                          goal.completed ? 'text-green-700' : 'text-foreground'
                        }`}>
                          {goal.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-2">
                  <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs mb-2">
                    {goal.completed ? 'Completed' : 'In Progress'}
                  </Badge>
                  {editingId !== goal.id && isParent && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => onEditClick(goal)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeeklyGoalsSection;
