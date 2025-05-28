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
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHouseholds = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏠 Fetching households for user:', user.id);
      
      // Set timeout for household fetch
      const fetchTimeout = setTimeout(() => {
        console.error('⏰ Household fetch timeout');
        setError('Loading households took too long');
        setLoading(false);
      }, 10000); // 10 second timeout

      const { data, error: fetchError } = await supabase
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

      clearTimeout(fetchTimeout);

      if (fetchError) {
        console.error('❌ Error fetching households:', fetchError);
        setError('Failed to load households');
        toast({
          title: "Failed to fetch households",
          description: fetchError.message,
          variant: "destructive"
        });
        setHouseholds([]);
      } else {
        const formatted = (data ?? []).map((hm: any) => ({
          ...hm.households,
          role: hm.role
        }));
        console.log('✅ Households loaded:', formatted.length);
        setHouseholds(formatted);
        setError(null);
      }
    } catch (err: any) {
      console.error('🚨 Household fetch error:', err);
      setError('Failed to load households');
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

  const leaveHousehold = async (householdId: string) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to leave a household.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // First, check if user is an admin/owner
      const { data: userMembership, error: membershipError } = await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        toast({
          title: "Error",
          description: "Failed to check your membership status.",
          variant: "destructive"
        });
        return false;
      }

      // If user is admin/owner, check if there are other admins/owners
      if (userMembership.role === 'admin' || userMembership.role === 'owner') {
        const { data: adminMembers, error: adminError } = await supabase
          .from('household_members')
          .select('user_id')
          .eq('household_id', householdId)
          .in('role', ['admin', 'owner'])
          .neq('user_id', user.id);

        if (adminError) {
          toast({
            title: "Error",
            description: "Failed to check admin members.",
            variant: "destructive"
          });
          return false;
        }

        if (!adminMembers || adminMembers.length === 0) {
          toast({
            title: "Cannot leave household",
            description: "You cannot leave this household as you are the only admin. Please promote another member to admin first.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Remove user from household
      const { error: leaveError } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

      if (leaveError) {
        toast({
          title: "Failed to leave household",
          description: leaveError.message,
          variant: "destructive"
        });
        return false;
      }

      // Refresh households
      fetchHouseholds();

      toast({
        title: "Success",
        description: "You have successfully left the household.",
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
    if (user) {
      fetchHouseholds();
    } else {
      setHouseholds([]);
      setLoading(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    households,
    loading,
    error,
    retry: fetchHouseholds,
    fetchHouseholds,
    createHousehold,
    joinHousehold,
    leaveHousehold
  };
};
