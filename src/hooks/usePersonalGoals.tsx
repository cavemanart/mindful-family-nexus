
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PersonalGoal {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_by_name: string;
  household_id: string;
  completed: boolean;
  is_shared_with_family: boolean;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export const usePersonalGoals = (householdId: string | null, userId: string | null) => {
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPersonalGoals = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPersonalGoals(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching personal goals",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPersonalGoal = async (goalData: Omit<PersonalGoal, 'id' | 'created_at' | 'updated_at' | 'household_id' | 'created_by'>) => {
    if (!householdId || !userId) return false;

    try {
      const { error } = await supabase
        .from('personal_goals')
        .insert([{ 
          ...goalData, 
          household_id: householdId,
          created_by: userId
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Personal goal added successfully!",
      });
      
      fetchPersonalGoals();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding personal goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePersonalGoal = async (id: string, updates: Partial<PersonalGoal>) => {
    try {
      const { error } = await supabase
        .from('personal_goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchPersonalGoals();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating personal goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deletePersonalGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('personal_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Personal goal deleted",
        description: "The goal has been deleted.",
      });
      
      fetchPersonalGoals();
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting personal goal",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPersonalGoals();
  }, [householdId]);

  return {
    personalGoals,
    loading,
    addPersonalGoal,
    updatePersonalGoal,
    deletePersonalGoal,
    refetch: fetchPersonalGoals
  };
};
