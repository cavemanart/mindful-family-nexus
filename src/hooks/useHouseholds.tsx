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

// Updated interface: only profiles (no users), matching FK
export interface HouseholdMember {
  role: string;
  user_id: string;
  profiles: {
    id?: string;
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

  // Members and kids filtered by is_child_account
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

  // Updated: fetch household members joined to profiles (no 'users' table)
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
          profiles (
            id,
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

  useEffect(() => {
    if (selectedHousehold?.id) {
      fetchHouseholdMembersWithChildFlag(selectedHousehold.id);
    } else {
      setMembers([]);
      setKids([]);
    }
  }, [selectedHousehold?.id]);

  // ... rest of your existing createHousehold, joinHousehold, leaveHousehold functions unchanged

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
    // existing methods
    createHousehold,
    joinHousehold,
    leaveHousehold,
    // new data
    members,
    kids,
  };
};
