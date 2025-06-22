
import React, { useState } from "react";
import { Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WeeklyWin } from "@/hooks/useWeeklyData";
import { useChildren } from "@/hooks/useChildren";

interface WeeklyWinsSectionProps {
  wins: WeeklyWin[];
  loading: boolean;
  addWin: (data: { title: string; description: string; added_by: string }) => Promise<boolean>;
  householdId: string;
}

const WeeklyWinsSection: React.FC<WeeklyWinsSectionProps> = ({
  wins,
  loading,
  addWin,
  householdId,
}) => {
  const { children } = useChildren(householdId);
  const [isAddingWin, setIsAddingWin] = useState(false);
  const [newWin, setNewWin] = useState({ title: "", description: "", added_by: "" });

  const handleAddWin = async () => {
    if (newWin.title.trim() && newWin.added_by) {
      const success = await addWin(newWin);
      if (success) {
        setNewWin({ title: '', description: '', added_by: '' });
        setIsAddingWin(false);
      }
    }
  };

  // Get actual family members from children data
  const familyMembers = children.map(child => `${child.first_name} ${child.last_name || ''}`.trim());

  return (
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
  );
};

export default WeeklyWinsSection;
