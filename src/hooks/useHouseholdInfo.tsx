
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HouseholdInfo {
  id: string;
  household_id: string;
  info_type: string;
  title: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useHouseholdInfo = (householdId?: string) => {
  const [householdInfo, setHouseholdInfo] = useState<HouseholdInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHouseholdInfo = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('household_info')
        .select('*')
        .eq('household_id', householdId)
        .order('info_type')
        .order('title');

      if (error) {
        toast({
          title: "Error fetching household info",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setHouseholdInfo(data || []);
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

  const addHouseholdInfo = async (info: Omit<HouseholdInfo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('household_info')
        .insert([info])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding household info",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      fetchHouseholdInfo();
      toast({
        title: "Success",
        description: "Household info added successfully"
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
    fetchHouseholdInfo();
  }, [householdId]);

  return {
    householdInfo,
    loading,
    fetchHouseholdInfo,
    addHouseholdInfo
  };
};
