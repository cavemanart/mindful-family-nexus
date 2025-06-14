
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
}

interface CreateChildData {
  firstName: string;
  lastName: string;
  pin: string;
  avatarSelection: string;
  parentId: string;
  householdId: string;
}

interface UpdateChildData {
  firstName: string;
  lastName: string;
  pin?: string;
  avatarSelection: string;
}

export const useChildrenManagement = (householdId: string | null) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChildren = async () => {
    if (!householdId) {
      console.log('❌ No household ID provided for fetching children');
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching children for household:', householdId);
      setLoading(true);
      
      // Simplified query: Join profiles directly with household_members
      const { data: childrenData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_selection,
          parent_id,
          created_at,
          is_child_account,
          role
        `)
        .eq('is_child_account', true)
        .in('id', 
          supabase
            .from('household_members')
            .select('user_id')
            .eq('household_id', householdId)
        );

      if (error) {
        console.error('❌ Error fetching children:', error);
        throw error;
      }

      console.log('📊 Raw children data:', childrenData);

      // Process and validate the data
      const processedChildren = (childrenData || [])
        .filter(child => {
          if (!child) {
            console.warn('⚠️ Found null child record');
            return false;
          }
          
          const isValid = child.is_child_account === true || child.role === 'child';
          if (isValid) {
            console.log('👶 Valid child found:', child.first_name, child.last_name);
          }
          return isValid;
        })
        .map(child => ({
          id: child.id,
          first_name: child.first_name || 'Unknown',
          last_name: child.last_name || 'Child',
          avatar_selection: child.avatar_selection || 'bear',
          parent_id: child.parent_id || '',
          created_at: child.created_at || new Date().toISOString()
        }));

      console.log('👥 Processed children:', processedChildren.length, processedChildren);
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
        console.error('❌ RPC Error creating child:', error);
        throw error;
      }

      console.log('✅ Child created successfully with ID:', data);
      
      toast({
        title: "Success",
        description: "Child account created successfully!",
      });

      // Immediate refresh after creation
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

      // Only update PIN if provided
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

  // Set up real-time subscription for immediate updates
  useEffect(() => {
    console.log('🔄 useChildrenManagement effect triggered, householdId:', householdId);
    fetchChildren();

    if (!householdId) return;

    // Set up real-time subscription for profiles changes
    const profilesChannel = supabase
      .channel(`profiles_changes_${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'is_child_account=eq.true'
        },
        (payload) => {
          console.log('📡 Real-time profile change detected:', payload);
          // Refresh data when changes occur
          setTimeout(() => fetchChildren(), 500);
        }
      )
      .subscribe();

    // Set up real-time subscription for household_members changes
    const membersChannel = supabase
      .channel(`household_members_changes_${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_members',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          console.log('📡 Real-time household member change detected:', payload);
          // Refresh data when changes occur
          setTimeout(() => fetchChildren(), 500);
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(membersChannel);
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
