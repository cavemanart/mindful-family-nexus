
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
      setLoading(false);
      return;
    }

    try {
      // First get household member user IDs
      const { data: householdMembers, error: membersError } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', householdId);

      if (membersError) throw membersError;

      const userIds = householdMembers.map(member => member.user_id);

      // Then get child profiles for those user IDs
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_selection,
          parent_id,
          created_at
        `)
        .eq('is_child_account', true)
        .in('id', userIds);

      if (error) throw error;
      setChildren(data || []);
    } catch (error: any) {
      console.error('Error fetching children:', error);
      toast({
        title: "Error fetching children",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createChild = async (childData: CreateChildData) => {
    if (!householdId) throw new Error('No household selected');

    try {
      const { data, error } = await supabase.rpc('create_child_profile', {
        p_first_name: childData.firstName,
        p_last_name: childData.lastName,
        p_pin: childData.pin,
        p_avatar_selection: childData.avatarSelection,
        p_parent_id: childData.parentId,
        p_household_id: householdId
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Child account created successfully!",
      });

      fetchChildren();
      return data;
    } catch (error: any) {
      console.error('Error creating child:', error);
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

      fetchChildren();
    } catch (error: any) {
      console.error('Error updating child:', error);
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

      fetchChildren();
    } catch (error: any) {
      console.error('Error deleting child:', error);
      toast({
        title: "Error deleting child",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchChildren();
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
