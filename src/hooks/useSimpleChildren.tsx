
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HouseholdChild {
  id: string;
  household_id: string;
  first_name: string;
  last_name: string;
  pin: string;
  avatar_selection: string;
  parent_id: string;
  created_at: string;
  updated_at: string;
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

export const useSimpleChildren = (householdId: string | null) => {
  const [children, setChildren] = useState<HouseholdChild[]>([]);
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
      
      // Use type assertion to work around TypeScript limitations
      const { data, error } = await (supabase as any)
        .from('household_children')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching children:', error);
        throw error;
      }

      console.log('✅ Children fetched successfully:', data?.length || 0);
      setChildren((data as HouseholdChild[]) || []);
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
      
      const { data, error } = await (supabase as any)
        .from('household_children')
        .insert({
          household_id: householdId,
          first_name: childData.firstName,
          last_name: childData.lastName,
          pin: childData.pin,
          avatar_selection: childData.avatarSelection,
          parent_id: childData.parentId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating child:', error);
        throw error;
      }

      console.log('✅ Child created successfully:', data);
      
      toast({
        title: "Success",
        description: "Child account created successfully!",
      });

      await fetchChildren();
      return data;
    } catch (error: any) {
      console.error('❌ Error creating child:', error);
      throw new Error(error.message || 'Failed to create child account');
    }
  };

  const updateChild = async (childId: string, updates: UpdateChildData) => {
    try {
      console.log('📝 Updating child:', childId, updates);

      const updateData: any = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_selection: updates.avatarSelection,
        updated_at: new Date().toISOString()
      };

      if (updates.pin && updates.pin.trim()) {
        updateData.pin = updates.pin;
      }

      const { error } = await (supabase as any)
        .from('household_children')
        .update(updateData)
        .eq('id', childId);

      if (error) throw error;

      console.log('✅ Child updated successfully');

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
      console.log('🗑️ Deleting child:', childId);

      const { error } = await (supabase as any)
        .from('household_children')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      console.log('✅ Child deleted successfully');

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

    const channel = supabase
      .channel(`household_children_${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_children',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          console.log('📡 Child change detected:', payload);
          setTimeout(() => fetchChildren(), 300);
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
