
import React from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyWinsSection from './WeeklyWinsSection';
import WeeklyGoalsSection from './WeeklyGoalsSection';
import PersonalGoalsSection from './PersonalGoalsSection';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { usePersonalGoals } from '@/hooks/usePersonalGoals';
import { useAuth } from '@/hooks/useAuth';

interface WeeklySyncProps {
  selectedHousehold: { id: string } | null;
}

const WeeklySync = ({ selectedHousehold }: WeeklySyncProps) => {
  const { user } = useAuth();
  const { wins, goals, loading, addWin, addGoal, toggleGoal, deleteGoal, editGoal } = useWeeklyData(selectedHousehold?.id || null);
  const { 
    personalGoals, 
    loading: personalLoading, 
    addPersonalGoal, 
    updatePersonalGoal, 
    deletePersonalGoal 
  } = usePersonalGoals(selectedHousehold?.id || null, user?.id || null);

  // In a real app, familyMembers would be fetched from household data.
  const familyMembers = ['Mom', 'Dad', 'Emma', 'Jack'];
  
  // Mock user data - in real app this would come from user profile
  const currentUserName = user?.user_metadata?.first_name || 'User';
  const isParent = user?.user_metadata?.role !== 'child';

  if (loading || personalLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading weekly data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2 mb-2">
          <Calendar className="text-blue-500" size={32} />
          Weekly Family Sync
        </h2>
        <p className="text-muted-foreground">Celebrate wins and set goals together</p>
      </div>

      <Tabs defaultValue="wins" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wins">Family Wins</TabsTrigger>
          <TabsTrigger value="assigned">
            {isParent ? "Assigned Goals" : "My Assignments"}
          </TabsTrigger>
          <TabsTrigger value="personal">Personal Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="wins" className="space-y-6">
          <WeeklyWinsSection
            wins={wins}
            loading={loading}
            addWin={addWin}
            familyMembers={familyMembers}
          />
        </TabsContent>

        <TabsContent value="assigned" className="space-y-6">
          <WeeklyGoalsSection
            goals={goals}
            loading={loading}
            addGoal={addGoal}
            toggleGoal={toggleGoal}
            familyMembers={familyMembers}
            deleteGoal={deleteGoal}
            editGoal={editGoal}
            currentUserName={currentUserName}
            isParent={isParent}
          />
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <PersonalGoalsSection
            personalGoals={personalGoals}
            loading={personalLoading}
            addPersonalGoal={addPersonalGoal}
            updatePersonalGoal={updatePersonalGoal}
            deletePersonalGoal={deletePersonalGoal}
            currentUserName={currentUserName}
            currentUserId={user?.id || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeeklySync;
