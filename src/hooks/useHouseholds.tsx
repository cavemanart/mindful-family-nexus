import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Household {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  role?: string;
  user_id?: string; // Add this if you want to type it
}

export const useHouseholds = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHouseholds = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          role,
          households (
            id,
            name,
            description,
            invite_code,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Failed to fetch households",
          description: error.message,
          variant: "destructive"
        });
        setHouseholds([]);
      } else {
        const formatted = (data ?? []).map((hm: any) => ({
          ...hm.households,
          role: hm.role
        }));
        setHouseholds(formatted);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
      setHouseholds([]);
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async ({
    name,
    description
  }: { name: string; description: string }) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a household.",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('households')
      .insert([
        {
          name,
          description,
          created_by: user.id,
          user_id: user.id // <-- This line fixes the RLS/NOT NULL error
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Failed to create household",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    // Optionally refresh the list
    fetchHouseholds();

    return data;
  };

  useEffect(() => {
    fetchHouseholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    households,
    loading,
    fetchHouseholds,
    createHousehold
  };
};
