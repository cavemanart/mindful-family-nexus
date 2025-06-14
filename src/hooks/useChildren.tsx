
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

  const fetchChildren = async () => {
    if (!householdId) {
      console.log('🔍 useChildren: No household ID provided');
      return;
    }
    
    console.log('🔍 useChildren: Fetching children for household:', householdId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_selection,
          created_at,
          household_members!inner(household_id)
        `)
        .eq('is_child_account', true)
        .eq('household_members.household_id', householdId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('✅ useChildren: Fetched children:', data?.length || 0);
      setChildren(data || []);
    } catch (error) {
      console.error('❌ useChildren: Error fetching children:', error);
      toast.error('Failed to load children');
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
    try {
      const { data, error } = await supabase.rpc('create_child_profile', {
        p_first_name: childData.firstName,
        p_last_name: childData.lastName,
        p_pin: childData.pin,
        p_avatar_selection: childData.avatarSelection,
        p_parent_id: user.id,
        p_household_id: householdId
      });

      if (error) throw error;
      
      console.log('✅ useChildren: Child created successfully');
      toast.success(`${childData.firstName} has been added to the family!`);
      
      // Force refresh the children list
      await fetchChildren();
      return true;
    } catch (error) {
      console.error('❌ useChildren: Error creating child:', error);
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
      .channel('children-changes')
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
          fetchChildren();
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
          fetchChildren();
        }
      )
      .subscribe();

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
    refreshChildren: fetchChildren
  };
};
