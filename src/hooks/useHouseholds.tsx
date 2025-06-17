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

// New interface for members including profiles with is_child_account flag
export interface HouseholdMember {
  role: string;
  user_id: string;
  users: {
    id: string;
    email: string;
  };
  profiles: {
    first_name?: string;
    last_name?: string;
    is_child_account?: boolean;
    parent_id?: string;
    avatar_url?: string;
  };
}

export const useHouseholds = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- New states ---
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [kids, setKids] = useState<HouseholdMember[]>([]);

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

      const fetchTimeout = setTimeout(() => {
        console.error('⏰ Household fetch timeout');
        setError('Loading households took too long');
        setLoading(false);
      }, 10000);

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

        if (formatted.length > 0 && !selectedHousehold) {
          setSelectedHousehold(formatted[0]);
        }

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

  const selectHousehold = (household: Household) => {
    console.log('🏠 Selecting household:', household.name);
    setSelectedHousehold(household);
  };

  // --- NEW FUNCTION: fetch household members with profile info including is_child_account ---
  const fetchHouseholdMembersWithChildFlag = async (householdId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          role,
          user_id,
          users (
            id,
            email
          ),
          profiles (
            first_name,
            last_name,
            is_child_account,
            parent_id,
            avatar_url
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        setError('Failed to load household members');
        toast({
          title: "Failed to fetch household members",
          description: error.message,
          variant: "destructive"
        });
        setMembers([]);
        setKids([]);
        return;
      }

      setMembers(data ?? []);
      setKids((data ?? []).filter((hm) => hm.profiles?.is_child_account === true));
      setError(null);
    } catch (err: any) {
      setError('Failed to load household members');
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
      setMembers([]);
      setKids([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Watch for selectedHousehold changes and fetch members ---
  useEffect(() => {
    if (selectedHousehold?.id) {
      fetchHouseholdMembersWithChildFlag(selectedHousehold.id);
    } else {
      setMembers([]);
      setKids([]);
    }
  }, [selectedHousehold?.id]);

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

      fetchHouseholds();

      toast({
        title: "Success",
        description: "Household created successfully!",
      });

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

  const joinHousehold = async (joinCode: string, role: string = 'member') => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to join a household.",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🔗 Joining household with code:', joinCode, 'as role:', role);

      // Normalize casing to match DB format: Title-Case format (Red-Cloud-42)
      const cleanedCode = joinCode.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

      const { data, error } = await supabase.rpc('join_household_with_code', {
        _code: cleanedCode,
        _name: user.email?.split('@')[0] || 'User',
        _avatar_selection: 'default',
        _device_id: '',
        _role: role
      } as any);

      if (error) {
        console.error('❌ Join household error:', error);
        toast({
          title: "Failed to join household",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Successfully joined household');

      fetchHouseholds();

      toast({
        title: "Success",
        description: "Successfully joined household!",
      });

      return true;
    } catch (err: any) {
      console.error('🚨 Join household error:', err);
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
      setSelectedHousehold(null);
      setMembers([]);
      setKids([]);
      setLoading(false);
      setError(null);
    }
  }, [user?.id]);

  return {
    households,
    selectedHousehold,
    selectHousehold,
    loading,
    error,
    retry: fetchHouseholds,
    fetchHouseholds,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    // new exports
    members,
    kids,
  };
};
