
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FamilyMemory {
  id: string;
  household_id: string;
  title: string;
  content: string;
  memory_type: string;
  emotion_tags: string[];
  family_members: string[];
  added_by: string;
  added_by_user_id?: string;
  memory_date: string;
  created_at: string;
  updated_at: string;
}

export const useFamilyMemories = (householdId: string | null) => {
  const [memories, setMemories] = useState<FamilyMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMemories = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_memories')
        .select('*')
        .eq('household_id', householdId)
        .order('memory_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching memories",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMemory = async (memoryData: Omit<FamilyMemory, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('family_memories')
        .insert([{ ...memoryData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Memory added!",
        description: "Your family memory has been saved.",
      });
      
      fetchMemories();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding memory",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMemory = async (id: string, updates: Partial<FamilyMemory>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('family_memories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('household_id', householdId);

      if (error) throw error;
      
      toast({
        title: "Memory updated",
        description: "Your family memory has been updated.",
      });
      
      fetchMemories();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating memory",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteMemory = async (id: string) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('family_memories')
        .delete()
        .eq('id', id)
        .eq('household_id', householdId);

      if (error) throw error;
      
      toast({
        title: "Memory deleted",
        description: "The family memory has been removed.",
      });
      
      fetchMemories();
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting memory",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [householdId]);

  return {
    memories,
    loading,
    addMemory,
    updateMemory,
    deleteMemory,
    refetch: fetchMemories
  };
};
