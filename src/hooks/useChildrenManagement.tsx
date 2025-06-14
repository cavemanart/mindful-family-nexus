
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
      
      // Get all household members who are child accounts
      const { data: householdMembers, error: membersError } = await supabase
        .from('household_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_selection,
            parent_id,
            created_at,
            is_child_account,
            role
          )
        `)
        .eq('household_id', householdId);

      if (membersError) {
        console.error('❌ Error fetching household members:', membersError);
        throw membersError;
      }

      console.log('📊 Raw household members data:', householdMembers);

      // Filter for child accounts and validate profiles
      const childProfiles = householdMembers
        ?.filter(member => {
          if (!member.profiles) {
            console.warn('⚠️ Found household member with null profile:', member.user_id);
            return false;
          }
          
          const profile = member.profiles;
          const isChildAccount = profile.is_child_account === true || profile.role === 'child';
          
          if (isChildAccount) {
            console.log('👶 Found child profile:', profile.first_name, profile.last_name);
          }
          
          return isChildAccount;
        })
        .map(member => ({
          id: member.profiles.id,
          first_name: member.profiles.first_name || 'Unknown',
          last_name: member.profiles.last_name || 'Child',
          avatar_selection: member.profiles.avatar_selection || 'bear',
          parent_id: member.profiles.parent_id || '',
          created_at: member.profiles.created_at || new Date().toISOString()
        })) || [];

      console.log('👥 Processed children:', childProfiles.length, childProfiles);
      setChildren(childProfiles);
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

      // Wait a moment then refetch to ensure we get the latest data
      setTimeout(() => {
        console.log('🔄 Refetching children after creation...');
        fetchChildren();
      }, 1000);
      
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

  useEffect(() => {
    console.log('🔄 useChildrenManagement effect triggered, householdId:', householdId);
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
