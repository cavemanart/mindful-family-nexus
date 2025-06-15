import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeeklyWin {
  id: string;
  title: string;
  description: string;
  added_by: string;
  created_at: string;
  household_id: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  household_id: string;
}

export const useWeeklyData = (householdId: string | null) => {
  const [wins, setWins] = useState<WeeklyWin[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWeeklyData = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch weekly wins
      const { data: winsData, error: winsError } = await supabase
        .from('weekly_wins')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (winsError) throw winsError;

      // Fetch weekly goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      setWins(winsData || []);
      setGoals(goalsData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching weekly data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addWin = async (winData: Omit<WeeklyWin, 'id' | 'created_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('weekly_wins')
        .insert([{ ...winData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Win added successfully!",
      });
      
      fetchWeeklyData();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding win",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const addGoal = async (goalData: Omit<WeeklyGoal, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('weekly_goals')
        .insert([{ ...goalData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Goal added successfully!",
      });
      
      fetchWeeklyData();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleGoal = async (id: string) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return false;

      const { error } = await supabase
        .from('weekly_goals')
        .update({ 
          completed: !goal.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchWeeklyData();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!householdId) return false;
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('id', id)
        .eq('household_id', householdId);
      if (error) throw error;
      toast({
        title: "Goal deleted",
        description: "The goal has been deleted.",
        variant: "default"
      });
      fetchWeeklyData();
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const editGoal = async (
    id: string, 
    data: Partial<Omit<WeeklyGoal, 'id' | 'household_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!householdId) return false;
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('household_id', householdId);
      if (error) throw error;
      toast({
        title: "Goal updated",
        description: "The goal has been updated.",
        variant: "default"
      });
      fetchWeeklyData();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [householdId]);

  return {
    wins,
    goals,
    loading,
    addWin,
    addGoal,
    toggleGoal,
    deleteGoal,
    editGoal,
    refetch: fetchWeeklyData
  };
};
