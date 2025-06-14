
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
    if (!householdId) return;
    
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
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
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
      
      toast.success(`${childData.firstName} has been added to the family!`);
      await fetchChildren(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error creating child:', error);
      toast.error('Failed to add child');
      return false;
    } finally {
      setCreating(false);
    }
  };

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
