
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

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const useHouseholds = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHouseholds = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          household_id,
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

      if (error) throw error;

      const householdsData = data?.map(item => ({
        ...item.households,
        role: item.role
      })) || [];

      setHouseholds(householdsData);
    } catch (error) {
      console.error('Error fetching households:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch households',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async (name: string, description: string = '') => {
    if (!user) return null;

    try {
      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      await fetchHouseholds();
      
      toast({
        title: 'Success',
        description: 'Household created successfully!',
      });

      return household;
    } catch (error) {
      console.error('Error creating household:', error);
      toast({
        title: 'Error',
        description: 'Failed to create household',
        variant: 'destructive',
      });
      return null;
    }
  };

  const joinHousehold = async (inviteCode: string) => {
    if (!user) return false;

    try {
      // Find household by invite code
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();

      if (householdError || !household) {
        toast({
          title: 'Error',
          description: 'Invalid invite code',
          variant: 'destructive',
        });
        return false;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('id')
        .eq('household_id', household.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: 'Info',
          description: 'You are already a member of this household',
        });
        return false;
      }

      // Add user to household
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      await fetchHouseholds();
      
      toast({
        title: 'Success',
        description: 'Successfully joined household!',
      });

      return true;
    } catch (error) {
      console.error('Error joining household:', error);
      toast({
        title: 'Error',
        description: 'Failed to join household',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchHouseholds();
    }
  }, [user]);

  return {
    households,
    loading,
    createHousehold,
    joinHousehold,
    refetch: fetchHouseholds
  };
};
