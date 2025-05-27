
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appreciation {
  id: string;
  message: string;
  from_member: string;
  to_member: string;
  reactions: number;
  created_at: string;
  household_id: string;
}

export const useAppreciations = (householdId: string | null) => {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppreciations = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appreciations')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppreciations(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching appreciations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAppreciation = async (appreciationData: Omit<Appreciation, 'id' | 'created_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('appreciations')
        .insert([{ ...appreciationData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appreciation shared successfully!",
      });
      
      fetchAppreciations();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const addReaction = async (id: string) => {
    try {
      const appreciation = appreciations.find(a => a.id === id);
      if (!appreciation) return false;

      const { error } = await supabase
        .from('appreciations')
        .update({ reactions: appreciation.reactions + 1 })
        .eq('id', id);

      if (error) throw error;
      fetchAppreciations();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding reaction",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAppreciations();
  }, [householdId]);

  return {
    appreciations,
    loading,
    addAppreciation,
    addReaction,
    refetch: fetchAppreciations
  };
};
