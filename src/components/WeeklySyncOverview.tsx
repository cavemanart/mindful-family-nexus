
import React from "react";
import { useWeeklyData } from "@/hooks/useWeeklyData";
import { useFamilyMemories } from "@/hooks/useFamilyMemories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarCheck, CalendarMinus, CalendarPlus, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklySyncOverviewProps {
  householdId: string;
  onViewFullSync?: () => void;
}

const WeeklySyncOverview: React.FC<WeeklySyncOverviewProps> = ({
  householdId,
  onViewFullSync,
}) => {
  const { goals, wins, loading: weeklyLoading, toggleGoal } = useWeeklyData(householdId);
  const { memories, loading: memoriesLoading } = useFamilyMemories(householdId);

  // Show only goals for this week
  const activeGoals = goals.filter((g) => !g.completed).slice(0, 2);
  const completedGoals = goals.filter((g) => g.completed);

  // Only show the two most recent wins
  const recentWins = wins.slice(0, 2);

  // Get recent memories from this week
  const thisWeek = new Date();
  const weekStart = new Date(thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()));
  const recentMemories = memories.filter(memory => 
    new Date(memory.memory_date) >= weekStart
  ).slice(0, 2);

  const loading = weeklyLoading || memoriesLoading;

  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/30 border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <CalendarPlus className="text-blue-500" size={20} />
          Weekly Family Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-foreground mb-1">Goals:</p>
          {loading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : goals.length === 0 ? (
            <span className="text-muted-foreground text-sm">No goals for this week.</span>
          ) : (
            <ul className="mb-2">
              {activeGoals.map((goal) => (
                <li key={goal.id} className="flex items-center justify-between mb-1">
                  <span className="text-sm">
                    <button
                      className={`mr-2 ${
                        goal.completed
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => toggleGoal(goal.id)}
                      aria-label={`Mark '${goal.title}' as done`}
                    >
                      <CalendarCheck size={16} />
                    </button>
                    {goal.title}
                  </span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {goal.completed ? "Complete" : "In Progress"}
                  </Badge>
                </li>
              ))}
              {activeGoals.length === 0 && (
                <li className="text-sm text-muted-foreground">All goals complete!</li>
              )}
            </ul>
          )}
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <CalendarMinus size={14} className="inline" />
              {goals.filter((g) => !g.completed).length} in progress
            </Badge>
            <Badge variant="default" className="text-xs flex items-center gap-1">
              <CalendarCheck size={14} className="inline" />
              {completedGoals.length} complete
            </Badge>
          </div>
        </div>

        <div>
          <p className="font-medium text-foreground mb-1">Recent Wins:</p>
          {loading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : wins.length === 0 ? (
            <span className="text-muted-foreground text-sm">No wins logged yet.</span>
          ) : (
            <ul className="mb-2">
              {recentWins.map((win) => (
                <li key={win.id} className="text-sm mb-1">
                  <span className="font-medium">{win.title}</span>{" "}
                  <span className="text-muted-foreground">({win.added_by})</span>
                  <span className="ml-2 text-muted-foreground text-xs">
                    {new Date(win.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="font-medium text-foreground mb-1 flex items-center gap-1">
            <Heart className="h-4 w-4 text-pink-500" />
            This Week's Memories:
          </p>
          {loading ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : recentMemories.length === 0 ? (
            <span className="text-muted-foreground text-sm">No memories captured this week.</span>
          ) : (
            <ul className="mb-2">
              {recentMemories.map((memory) => (
                <li key={memory.id} className="text-sm mb-1">
                  <span className="font-medium">{memory.title}</span>{" "}
                  <span className="text-muted-foreground">({memory.added_by})</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {memory.memory_type}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Badge variant="secondary" className="text-xs flex items-center gap-1 w-fit">
            <Heart size={12} className="inline" />
            {memories.length} total memories
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={onViewFullSync}
        >
          View Full Weekly Sync
        </Button>
      </CardContent>
    </Card>
  );
};

export default WeeklySyncOverview;
