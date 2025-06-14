
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  avatar_selection: string;
  pin?: string;
  created_at: string;
}

interface CreateChildData {
  firstName: string;
  lastName: string;
  pin: string;
  avatarSelection: string;
}

export const useChildren = (householdId?: string | null) => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchChildren = async (forceRefresh = false) => {
    if (!householdId) {
      console.log('🔍 useChildren: No household ID provided');
      setChildren([]);
      return;
    }
    
    console.log(`🔍 useChildren: Fetching children for household: ${householdId} ${forceRefresh ? '(FORCE REFRESH)' : ''}`);
    setLoading(true);
    
    try {
      // Step 1: Get all child profiles
      const { data: childProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_selection, created_at')
        .eq('is_child_account', true)
        .order('created_at', { ascending: true });

      if (profilesError) {
        console.error('❌ useChildren: Error fetching child profiles:', profilesError);
        throw profilesError;
      }

      console.log('🔍 useChildren: Found child profiles:', childProfiles?.length || 0);

      if (!childProfiles || childProfiles.length === 0) {
        console.log('🔍 useChildren: No child profiles found');
        setChildren([]);
        setLoading(false);
        return;
      }

      // Step 2: Filter by household membership
      const childIds = childProfiles.map(child => child.id);
      const { data: householdMembers, error: membersError } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', householdId)
        .in('user_id', childIds);

      if (membersError) {
        console.error('❌ useChildren: Error fetching household members:', membersError);
        throw membersError;
      }

      console.log('🔍 useChildren: Household members found:', householdMembers?.length || 0);

      // Filter child profiles to only include those in the household
      const householdChildIds = new Set(householdMembers?.map(member => member.user_id) || []);
      const householdChildren = childProfiles.filter(child => householdChildIds.has(child.id));

      console.log('✅ useChildren: Children in household:', householdChildren.length, householdChildren.map(c => c.first_name));
      
      // Remove any optimistic children and replace with real data
      setChildren(prev => {
        const optimisticChildren = prev.filter(child => child.id.startsWith('temp-'));
        const realChildren = householdChildren || [];
        console.log('🔄 useChildren: Updating state - removing', optimisticChildren.length, 'optimistic, adding', realChildren.length, 'real children');
        return realChildren;
      });
      
    } catch (error) {
      console.error('❌ useChildren: Error fetching children:', error);
      toast.error('Failed to load children');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const createChild = async (childData: CreateChildData): Promise<boolean> => {
    if (!user || !householdId) {
      toast.error('Missing user or household information');
      return false;
    }

    console.log('🔍 useChildren: Creating child:', childData.firstName);
    setCreating(true);
    
    // Optimistic update - add child to local state immediately
    const optimisticChild: Child = {
      id: `temp-${Date.now()}`, // Temporary ID
      first_name: childData.firstName,
      last_name: childData.lastName,
      avatar_selection: childData.avatarSelection,
      created_at: new Date().toISOString()
    };
    
    console.log('🔄 useChildren: Adding optimistic child to UI:', optimisticChild.first_name);
    setChildren(prev => [...prev, optimisticChild]);
    
    try {
      console.log('🔍 useChildren: Calling RPC create_child_profile with:', {
        p_first_name: childData.firstName,
        p_last_name: childData.lastName,
        p_avatar_selection: childData.avatarSelection,
        p_parent_id: user.id,
        p_household_id: householdId
      });

      const { data, error } = await supabase.rpc('create_child_profile', {
        p_first_name: childData.firstName,
        p_last_name: childData.lastName,
        p_pin: childData.pin,
        p_avatar_selection: childData.avatarSelection,
        p_parent_id: user.id,
        p_household_id: householdId
      });

      if (error) {
        console.error('❌ useChildren: RPC error:', error);
        // Remove optimistic update on error
        setChildren(prev => prev.filter(child => child.id !== optimisticChild.id));
        throw error;
      }
      
      console.log('✅ useChildren: Child created successfully, returned ID:', data);
      console.log('🔍 useChildren: Database write completed, waiting for real-time sync...');
      toast.success(`${childData.firstName} has been added to the family!`);
      
      // Note: We're relying on real-time subscriptions to update the UI
      // The optimistic child will be replaced when real data arrives
      
      return true;
    } catch (error) {
      console.error('❌ useChildren: Error creating child:', error);
      // Remove optimistic update on error
      setChildren(prev => prev.filter(child => child.id !== optimisticChild.id));
      toast.error('Failed to add child');
      return false;
    } finally {
      setCreating(false);
    }
  };

  // Set up real-time subscription for children changes
  useEffect(() => {
    if (!householdId) return;

    console.log('🔍 useChildren: Setting up real-time subscription for household:', householdId);

    const channel = supabase
      .channel(`children-changes-${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: `is_child_account=eq.true`
        },
        (payload) => {
          console.log('🔔 useChildren: Real-time INSERT detected:', payload.new);
          // Refresh children list when a new child is added
          setTimeout(() => {
            console.log('🔄 useChildren: Refreshing due to real-time INSERT');
            fetchChildren(true);
          }, 1500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `is_child_account=eq.true`
        },
        (payload) => {
          console.log('🔔 useChildren: Real-time UPDATE detected:', payload.new);
          // Refresh children list when a child is updated
          setTimeout(() => {
            console.log('🔄 useChildren: Refreshing due to real-time UPDATE');
            fetchChildren(true);
          }, 1500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'household_members'
        },
        (payload) => {
          console.log('🔔 useChildren: Real-time household member INSERT detected:', payload.new);
          // Refresh when new members are added
          if (payload.new.household_id === householdId) {
            setTimeout(() => {
              console.log('🔄 useChildren: Refreshing due to household member INSERT');
              fetchChildren(true);
            }, 1500);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 useChildren: Subscription status:', status);
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIPTION_ERROR) {
          console.error('❌ useChildren: Real-time subscription failed');
          toast.error('Real-time updates disabled - use refresh button to see new children');
        }
      });

    return () => {
      console.log('🔍 useChildren: Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  // Initial fetch
  useEffect(() => {
    fetchChildren();
  }, [householdId]);

  return {
    children,
    loading,
    creating,
    createChild,
    refreshChildren: () => fetchChildren(true)
  };
};
