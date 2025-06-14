
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  avatar_selection: string;
  parent_id: string;
  created_at: string;
  pin?: string;
}

interface CreateChildData {
  firstName: string;
  lastName: string;
  pin: string;
  avatarSelection: string;
  parentId: string;
}

interface UpdateChildData {
  firstName: string;
  lastName: string;
  pin?: string;
  avatarSelection: string;
}

export const useHouseholdChildren = (householdId: string | null) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChildren = async () => {
    if (!householdId) {
      console.log('❌ No household ID provided');
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching children for household:', householdId);
      setLoading(true);
      
      // Single JOIN query to get children in this household
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_selection,
          parent_id,
          created_at,
          pin,
          household_members!inner(household_id)
        `)
        .eq('is_child_account', true)
        .eq('household_members.household_id', householdId);

      if (error) {
        console.error('❌ Error fetching children:', error);
        throw error;
      }

      console.log('✅ Children fetched successfully:', data?.length || 0);
      
      // Map the data to our Child interface
      const processedChildren = (data || []).map(child => ({
        id: child.id,
        first_name: child.first_name || 'Unknown',
        last_name: child.last_name || 'Child',
        avatar_selection: child.avatar_selection || 'bear',
        parent_id: child.parent_id || '',
        created_at: child.created_at || new Date().toISOString(),
        pin: child.pin
      }));

      setChildren(processedChildren);
    } catch (error: any) {
      console.error('❌ Error fetching children:', error);
      toast({
        title: "Error fetching children",
        description: error.message || 'Failed to load children',
        variant: "destructive"
      });
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const createChild = async (childData: CreateChildData) => {
    if (!householdId) throw new Error('No household selected');

    try {
      console.log('👶 Creating child:', childData);
      
      const { data, error } = await supabase.rpc('create_child_profile', {
        p_first_name: childData.firstName,
        p_last_name: childData.lastName,
        p_pin: childData.pin,
        p_avatar_selection: childData.avatarSelection,
        p_parent_id: childData.parentId,
        p_household_id: householdId
      });

      if (error) {
        console.error('❌ Error creating child:', error);
        throw error;
      }

      console.log('✅ Child created successfully');
      
      toast({
        title: "Success",
        description: "Child account created successfully!",
      });

      // Refresh the children list
      await fetchChildren();
      
      return data;
    } catch (error: any) {
      console.error('❌ Error creating child:', error);
      throw new Error(error.message || 'Failed to create child account');
    }
  };

  const updateChild = async (childId: string, updates: UpdateChildData) => {
    try {
      const updateData: any = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_selection: updates.avatarSelection
      };

      if (updates.pin && updates.pin.trim()) {
        updateData.pin = updates.pin;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', childId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Child account updated successfully!",
      });

      await fetchChildren();
    } catch (error: any) {
      console.error('❌ Error updating child:', error);
      throw new Error(error.message || 'Failed to update child account');
    }
  };

  const deleteChild = async (childId: string) => {
    try {
      // First remove from household_members
      await supabase
        .from('household_members')
        .delete()
        .eq('user_id', childId);

      // Then delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Child account deleted successfully!",
      });

      await fetchChildren();
    } catch (error: any) {
      console.error('❌ Error deleting child:', error);
      toast({
        title: "Error deleting child",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 Setting up children subscription for household:', householdId);
    fetchChildren();

    if (!householdId) return;

    // Single subscription for profiles changes
    const channel = supabase
      .channel(`household_children_${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'is_child_account=eq.true'
        },
        (payload) => {
          console.log('📡 Child profile change detected:', payload);
          // Small delay to ensure data consistency
          setTimeout(() => fetchChildren(), 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_members',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          console.log('📡 Household membership change detected:', payload);
          setTimeout(() => fetchChildren(), 500);
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up children subscription');
      supabase.removeChannel(channel);
    };
  }, [householdId]);

  return {
    children,
    loading,
    createChild,
    updateChild,
    deleteChild,
    refetch: fetchChildren
  };
};
