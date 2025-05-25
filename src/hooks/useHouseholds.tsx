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
}

export const useHouseholds = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // This flag is true only when the user is authenticated and user.id is present
  const canCreateHousehold = !!user?.id && !creating;

  // Fetch all households for the current user
  const fetchHouseholds = async () => {
    if (!user?.id) {
      setLoading(false);
      setHouseholds([]);
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
        // Flatten the data for easier use in UI
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

  // Create a new household for the current user
  const createHousehold = async ({
    name,
    description
  }: { name: string; description: string }) => {
    if (!user?.id) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a household.",
        variant: "destructive"
      });
      return null;
    }

    setCreating(true);

    // Optionally show the user ID in a toast for debugging (remove when done)
    // toast({
    //   title: "Debug: User ID",
    //   description: user.id,
    //   variant: "default"
    // });

    const { data, error } = await supabase
      .from('households')
      .insert([
        {
          name,
          description,
          created_by: user.id // Must be the Supabase Auth user UUID
        }
      ])
      .select()
      .single();

    setCreating(false);

    if (error) {
      toast({
        title: "Failed to create household",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    // Optionally refresh the list after creation
    await fetchHouseholds();

    return data;
  };

  // Fetch households when user logs in or changes
  useEffect(() => {
    fetchHouseholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    households,
    loading,
    fetchHouseholds,
    createHousehold,
    canCreateHousehold
  };
};
