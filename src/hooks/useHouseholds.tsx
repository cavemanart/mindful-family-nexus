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
  user_id?: string;
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

  const createHousehold = async (name: string, description: string) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to create a household.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert([
          {
            name,
            description,
            created_by: user.id,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (householdError) {
        toast({
          title: "Failed to create household",
          description: householdError.message,
          variant: "destructive"
        });
        return null;
      }

      // Add the creator as the owner of the household
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([
          {
            household_id: householdData.id,
            user_id: user.id,
            role: 'owner'
          }
        ]);

      if (memberError) {
        toast({
          title: "Failed to add user to household",
          description: memberError.message,
          variant: "destructive"
        });
        return null;
      }

      // Refresh the list
      fetchHouseholds();

      toast({
        title: "Success",
        description: "Household created successfully!",
      });

      // Return the household data with the role
      return { ...householdData, role: 'owner' };
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const joinHousehold = async (inviteCode: string) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to join a household.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // First, find the household with this invite code
      const { data: household, error: findError } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();

      if (findError || !household) {
        toast({
          title: "Invalid invite code",
          description: "No household found with this invite code.",
          variant: "destructive"
        });
        return false;
      }

      // Add user to household_members
      const { error: joinError } = await supabase
        .from('household_members')
        .insert([
          {
            household_id: household.id,
            user_id: user.id,
            role: 'member'
          }
        ]);

      if (joinError) {
        toast({
          title: "Failed to join household",
          description: joinError.message,
          variant: "destructive"
        });
        return false;
      }

      // Refresh households
      fetchHouseholds();

      toast({
        title: "Success",
        description: "Successfully joined household!",
      });

      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchHouseholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    households,
    loading,
    fetchHouseholds,
    createHousehold,
    joinHousehold
  };
};
