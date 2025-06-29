import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { pushNotificationService } from '@/lib/push-notifications';

export interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  due_date: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  household_id: string;
}

export const useChores = (householdId: string | null) => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChores = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chores')
        .select('*')
        .eq('household_id', householdId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setChores(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching chores",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addChore = async (choreData: Omit<Chore, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('chores')
        .insert([{ ...choreData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Chore added successfully!",
      });
      
      // Send push notification for chore assignment
      try {
        await pushNotificationService.sendChoreReminder(
          choreData.title,
          choreData.assigned_to
        );
      } catch (notifError) {
        console.warn('Failed to send chore notification:', notifError);
      }
      
      fetchChores();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding chore",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const createChore = async (choreData: Omit<Chore, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    return await addChore(choreData);
  };

  const updateChore = async (id: string, choreData: Partial<Omit<Chore, 'id' | 'created_at' | 'updated_at' | 'household_id'>>) => {
    try {
      const { error } = await supabase
        .from('chores')
        .update({ 
          ...choreData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Chore updated successfully!",
      });
      
      fetchChores();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating chore",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteChore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Chore deleted successfully!",
      });
      
      fetchChores();
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting chore",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleChore = async (id: string) => {
    try {
      const chore = chores.find(c => c.id === id);
      if (!chore) return false;

      const { error } = await supabase
        .from('chores')
        .update({ 
          completed: !chore.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      // Send notification when chore is completed
      if (!chore.completed) {
        try {
          await pushNotificationService.sendChoreReminder(
            `${chore.title} completed by ${chore.assigned_to}! 🎉`,
            'Family'
          );
        } catch (notifError) {
          console.warn('Failed to send completion notification:', notifError);
        }
      }
      
      fetchChores();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating chore",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchChores();
  }, [householdId]);

  return {
    chores,
    loading,
    addChore,
    createChore,
    updateChore,
    deleteChore,
    toggleChore,
    refetch: fetchChores
  };
};
