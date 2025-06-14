import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Appreciation {
  id: string;
  message: string;
  from_member: string;
  to_member: string;
  created_at: string;
  household_id: string;
  from_user_id?: string;
  to_user_id?: string;
}

export interface AppreciationComment {
  id: string;
  appreciation_id: string;
  household_id: string;
  commenter_name: string;
  comment: string;
  created_at: string;
}

export interface AppreciationReaction {
  id: string;
  appreciation_id: string;
  household_id: string;
  reactor_name: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const useAppreciations = (householdId: string | null) => {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [comments, setComments] = useState<{ [key: string]: AppreciationComment[] }>({});
  const [reactions, setReactions] = useState<{ [key: string]: AppreciationReaction[] }>({});
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  // Get current user's full name with proper null checks
  const getCurrentUserName = () => {
    if (!userProfile) {
      console.log('📝 useAppreciations: userProfile is null');
      return 'Unknown User';
    }
    
    if (userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`.trim();
    }
    
    if (userProfile.first_name) {
      return userProfile.first_name;
    }
    
    return 'Unknown User';
  };

  const fetchHouseholdMembers = async () => {
    if (!householdId) {
      console.log('📝 useAppreciations: No householdId provided');
      return;
    }

    try {
      console.log('📝 useAppreciations: Fetching household members for:', householdId);
      
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          profiles:user_id (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('❌ useAppreciations: Error fetching household members:', error);
        throw error;
      }
      
      console.log('📊 useAppreciations: Raw household members data:', data);
      
      const members = data?.map(member => {
        if (!member.profiles) {
          console.warn('⚠️ useAppreciations: Member has no profile:', member);
          return null;
        }
        
        return {
          id: member.profiles.id,
          first_name: member.profiles.first_name || 'Unknown',
          last_name: member.profiles.last_name || 'User',
          role: member.profiles.role || 'member'
        };
      }).filter(Boolean) || [];
      
      console.log('👥 useAppreciations: Processed members:', members);
      setHouseholdMembers(members);
    } catch (error: any) {
      console.error('❌ useAppreciations: Error fetching household members:', error);
      toast({
        title: "Error fetching family members",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchAppreciations = async () => {
    if (!householdId) {
      console.log('📝 useAppreciations: No householdId provided for appreciations');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 useAppreciations: Fetching appreciations for household:', householdId);
      
      const { data, error } = await supabase
        .from('appreciations')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ useAppreciations: Error fetching appreciations:', error);
        throw error;
      }
      
      console.log('💝 useAppreciations: Fetched appreciations:', data);
      
      // Transform data to match interface (remove reactions field if it exists)
      const transformedData = data?.map(item => ({
        id: item.id,
        message: item.message,
        from_member: item.from_member,
        to_member: item.to_member,
        created_at: item.created_at,
        household_id: item.household_id,
        from_user_id: item.from_user_id,
        to_user_id: item.to_user_id
      })) || [];
      
      setAppreciations(transformedData);
    } catch (error: any) {
      console.error('❌ useAppreciations: Error in fetchAppreciations:', error);
      toast({
        title: "Error fetching appreciations",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (appreciationId: string) => {
    if (!householdId) {
      console.log('📝 useAppreciations: No householdId for comments');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appreciation_comments')
        .select('*')
        .eq('appreciation_id', appreciationId)
        .eq('household_id', householdId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [appreciationId]: data || [] }));
    } catch (error: any) {
      console.error('❌ useAppreciations: Error fetching comments:', error);
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchReactions = async (appreciationId: string) => {
    if (!householdId) {
      console.log('📝 useAppreciations: No householdId for reactions');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appreciation_reactions')
        .select('*')
        .eq('appreciation_id', appreciationId)
        .eq('household_id', householdId);

      if (error) throw error;
      setReactions(prev => ({ ...prev, [appreciationId]: data || [] }));
    } catch (error: any) {
      console.error('❌ useAppreciations: Error fetching reactions:', error);
      toast({
        title: "Error fetching reactions",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addAppreciation = async (appreciationData: Omit<Appreciation, 'id' | 'created_at' | 'household_id' | 'from_member'>) => {
    if (!householdId) {
      toast({
        title: "Error",
        description: "No household selected",
        variant: "destructive"
      });
      return false;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add appreciations",
        variant: "destructive"
      });
      return false;
    }

    try {
      const currentUserName = getCurrentUserName();
      
      console.log('🔄 useAppreciations: Adding appreciation:', {
        ...appreciationData,
        household_id: householdId,
        from_member: currentUserName
      });
      
      const { error } = await supabase
        .from('appreciations')
        .insert([{ 
          ...appreciationData, 
          household_id: householdId,
          from_member: currentUserName
        }]);

      if (error) {
        console.error('❌ useAppreciations: Error adding appreciation:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Appreciation shared successfully!",
      });
      
      fetchAppreciations();
      return true;
    } catch (error: any) {
      console.error('❌ useAppreciations: Error adding appreciation:', error);
      toast({
        title: "Error adding appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateAppreciation = async (id: string, updates: Partial<Appreciation>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update appreciations",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🔄 useAppreciations: Updating appreciation:', id, updates);
      
      const { error } = await supabase
        .from('appreciations')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('❌ useAppreciations: Error updating appreciation:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Appreciation updated successfully!",
      });
      
      fetchAppreciations();
      return true;
    } catch (error: any) {
      console.error('❌ useAppreciations: Error updating appreciation:', error);
      toast({
        title: "Error updating appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteAppreciation = async (id: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete appreciations",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🔄 useAppreciations: Deleting appreciation:', id);
      
      const { error } = await supabase
        .from('appreciations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ useAppreciations: Error deleting appreciation:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Appreciation deleted successfully!",
      });
      
      fetchAppreciations();
      return true;
    } catch (error: any) {
      console.error('❌ useAppreciations: Error deleting appreciation:', error);
      toast({
        title: "Error deleting appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleReaction = async (appreciationId: string, reactorName: string) => {
    if (!householdId || !user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to react",
        variant: "destructive"
      });
      return false;
    }

    try {
      const existingReactions = reactions[appreciationId] || [];
      const userReaction = existingReactions.find(r => r.reactor_name === reactorName);

      if (userReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('appreciation_reactions')
          .delete()
          .eq('id', userReaction.id);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from('appreciation_reactions')
          .insert([{
            appreciation_id: appreciationId,
            household_id: householdId,
            reactor_name: reactorName
          }]);

        if (error) throw error;
      }

      fetchReactions(appreciationId);
      return true;
    } catch (error: any) {
      console.error('❌ useAppreciations: Error updating reaction:', error);
      toast({
        title: "Error updating reaction",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const addComment = async (appreciationId: string, commenterName: string, comment: string) => {
    if (!householdId || !user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('appreciation_comments')
        .insert([{
          appreciation_id: appreciationId,
          household_id: householdId,
          commenter_name: commenterName,
          comment: comment
        }]);

      if (error) throw error;
      
      fetchComments(appreciationId);
      return true;
    } catch (error: any) {
      console.error('❌ useAppreciations: Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('🔄 useAppreciations: Effect triggered with:', { householdId, userId: user?.id });
    
    // Only fetch if we have both householdId and user
    if (householdId && user?.id) {
      fetchAppreciations();
      fetchHouseholdMembers();
    } else {
      console.log('📝 useAppreciations: Skipping fetch - missing householdId or user');
      setLoading(false);
    }
  }, [householdId, user?.id]);

  return {
    appreciations,
    comments,
    reactions,
    householdMembers,
    loading,
    addAppreciation,
    updateAppreciation,
    deleteAppreciation,
    toggleReaction,
    addComment,
    fetchComments,
    fetchReactions,
    refetch: fetchAppreciations,
    getCurrentUserName
  };
};
