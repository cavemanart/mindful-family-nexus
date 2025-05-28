
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Medication {
  id: string;
  household_id: string;
  child_name: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  prescribing_doctor?: string;
  created_at: string;
  updated_at: string;
}

export const useMedications = (householdId?: string) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMedications = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('household_id', householdId)
        .order('child_name')
        .order('medication_name');

      if (error) {
        toast({
          title: "Error fetching medications",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setMedications(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async (medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([medication])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding medication",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      fetchMedications();
      toast({
        title: "Success",
        description: "Medication added successfully"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [householdId]);

  return {
    medications,
    loading,
    fetchMedications,
    addMedication
  };
};
