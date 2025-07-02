
import React from 'react';
import { Calendar, Loader2, Trophy, Target, User, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyWinsSection from './WeeklyWinsSection';
import WeeklyGoalsSection from './WeeklyGoalsSection';
import PersonalGoalsSection from './PersonalGoalsSection';
import FamilyMemoriesSection from './FamilyMemoriesSection';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { usePersonalGoals } from '@/hooks/usePersonalGoals';
import { useFamilyMemories } from '@/hooks/useFamilyMemories';
import { useAuth } from '@/hooks/useAuth';
import { useChildren } from '@/hooks/useChildren';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeeklySyncProps {
  selectedHousehold: { id: string } | null;
}

const WeeklySync = ({ selectedHousehold }: WeeklySyncProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { wins, goals, loading, addWin, addGoal, toggleGoal, deleteGoal, editGoal } = useWeeklyData(selectedHousehold?.id || null);
  const { 
    personalGoals, 
    loading: personalLoading, 
    addPersonalGoal, 
    updatePersonalGoal, 
    deletePersonalGoal 
  } = usePersonalGoals(selectedHousehold?.id || null, user?.id || null);
  
  const {
    memories,
    loading: memoriesLoading,
    addMemory,
    updateMemory,
    deleteMemory
  } = useFamilyMemories(selectedHousehold?.id || null);

  // Get actual household members from children data
  const { children } = useChildren(selectedHousehold?.id || '');
  const familyMembers = children.map(child => `${child.first_name} ${child.last_name || ''}`.trim());
  
  // Mock user data - in real app this would come from user profile
  const currentUserName = user?.user_metadata?.first_name || 'User';
  const isParent = user?.user_metadata?.role !== 'child';

  if (loading || personalLoading || memoriesLoading) {
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
        <p className="text-muted-foreground">Celebrate wins, set goals, and capture memories together</p>
      </div>

      <Tabs defaultValue="wins" className="w-full">
        <TabsList className={`grid w-full h-auto ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4'}`}>
          <TabsTrigger 
            value="wins" 
            className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'} flex items-center gap-1`}
          >
            <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className={isMobile ? 'truncate' : ''}>{isMobile ? 'Wins' : 'Family Wins'}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="assigned"
            className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'} flex items-center gap-1`}
          >
            <Target className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className={isMobile ? 'truncate' : ''}>
              {isMobile ? 'Goals' : (isParent ? "Assigned Goals" : "My Assignments")}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="personal"
            className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'} flex items-center gap-1`}
          >
            <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className={isMobile ? 'truncate' : ''}>{isMobile ? 'Personal' : 'Personal Goals'}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="memories"
            className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'} flex items-center gap-1`}
          >
            <Heart className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            <span className={isMobile ? 'truncate' : ''}>{isMobile ? 'Memories' : 'Family Memories'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wins" className="space-y-6">
          <WeeklyWinsSection
            wins={wins}
            loading={loading}
            addWin={addWin}
            householdId={selectedHousehold?.id || ''}
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

        <TabsContent value="memories" className="space-y-6">
          <FamilyMemoriesSection
            memories={memories}
            loading={memoriesLoading}
            addMemory={addMemory}
            updateMemory={updateMemory}
            deleteMemory={deleteMemory}
            householdId={selectedHousehold?.id || ''}
            currentUserName={currentUserName}
            currentUserId={user?.id || ''}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeeklySync;
