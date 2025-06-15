import React from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import WeeklyWinsSection from './WeeklyWinsSection';
import WeeklyGoalsSection from './WeeklyGoalsSection';
import { useWeeklyData } from '@/hooks/useWeeklyData';

interface WeeklySyncProps {
  selectedHousehold: { id: string } | null;
}

const WeeklySync = ({ selectedHousehold }: WeeklySyncProps) => {
  const { wins, goals, loading, addWin, addGoal, toggleGoal, deleteGoal, editGoal } = useWeeklyData(selectedHousehold?.id || null);

  // In a real app, familyMembers would be fetched from household data.
  const familyMembers = ['Mom', 'Dad', 'Emma', 'Jack'];

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
      <WeeklyWinsSection
        wins={wins}
        loading={loading}
        addWin={addWin}
        familyMembers={familyMembers}
      />
      <WeeklyGoalsSection
        goals={goals}
        loading={loading}
        addGoal={addGoal}
        toggleGoal={toggleGoal}
        familyMembers={familyMembers}
        deleteGoal={deleteGoal}
        editGoal={editGoal}
      />
    </div>
  );
};

export default WeeklySync;
