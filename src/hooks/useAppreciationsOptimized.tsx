
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Appreciation {
  id: string;
  message: string;
  from_member: string;
  to_member: string;
  from_user_id: string | null;
  to_user_id: string | null;
  created_at: string;
  household_id: string;
  reactions_count?: number;
  comments_count?: number;
  user_has_reacted?: boolean;
}

export interface AppreciationComment {
  id: string;
  appreciation_id: string;
  household_id: string;
  commenter_name: string;
  commenter_user_id: string | null;
  comment: string;
  created_at: string;
}

export interface AppreciationReaction {
  id: string;
  appreciation_id: string;
  household_id: string;
  reactor_name: string;
  reactor_user_id: string | null;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  full_name: string;
}

interface AppreciationsState {
  appreciations: Appreciation[];
  comments: Record<string, AppreciationComment[]>;
  reactions: Record<string, AppreciationReaction[]>;
  householdMembers: HouseholdMember[];
  loading: boolean;
  error: string | null;
}

export const useAppreciationsOptimized = (householdId: string | null) => {
  const [state, setState] = useState<AppreciationsState>({
    appreciations: [],
    comments: {},
    reactions: {},
    householdMembers: [],
    loading: true,
    error: null,
  });

  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  // Get current user's full name
  const currentUserName = useMemo(() => {
    if (!userProfile?.first_name || !userProfile?.last_name) return 'Unknown User';
    return `${userProfile.first_name} ${userProfile.last_name}`.trim();
  }, [userProfile]);

  // Fetch household members with optimized query
  const fetchHouseholdMembers = useCallback(async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          profiles!inner (
            id,
            first_name,
            last_name,
            role
          )
        `)
        .eq('household_id', householdId);

      if (error) throw error;

      const members = data?.map(member => ({
        id: member.profiles.id,
        first_name: member.profiles.first_name || 'Unknown',
        last_name: member.profiles.last_name || 'User',
        role: member.profiles.role || 'member',
        full_name: `${member.profiles.first_name || 'Unknown'} ${member.profiles.last_name || 'User'}`.trim()
      })) || [];

      setState(prev => ({ ...prev, householdMembers: members }));
    } catch (error: any) {
      console.error('Error fetching household members:', error);
      setState(prev => ({ ...prev, error: error.message }));
    }
  }, [householdId]);

  // Fetch appreciations with aggregated counts
  const fetchAppreciations = useCallback(async () => {
    if (!householdId || !user?.id) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch appreciations with reaction and comment counts
      const { data: appreciationsData, error: appreciationsError } = await supabase
        .from('appreciations')
        .select(`
          *,
          reactions_count:appreciation_reactions(count),
          comments_count:appreciation_comments(count),
          user_reaction:appreciation_reactions!left(id, reactor_user_id)
        `)
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (appreciationsError) throw appreciationsError;

      // Process appreciations with aggregated data
      const processedAppreciations = appreciationsData?.map(appreciation => ({
        ...appreciation,
        reactions_count: appreciation.reactions_count?.[0]?.count || 0,
        comments_count: appreciation.comments_count?.[0]?.count || 0,
        user_has_reacted: appreciation.user_reaction?.some(
          (reaction: any) => reaction.reactor_user_id === user.id
        ) || false
      })) || [];

      setState(prev => ({ 
        ...prev, 
        appreciations: processedAppreciations,
        loading: false 
      }));
    } catch (error: any) {
      console.error('Error fetching appreciations:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message, 
        loading: false 
      }));
      toast({
        title: "Error loading appreciations",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [householdId, user?.id, toast]);

  // Fetch comments for a specific appreciation
  const fetchComments = useCallback(async (appreciationId: string) => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('appreciation_comments')
        .select('*')
        .eq('appreciation_id', appreciationId)
        .eq('household_id', householdId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        comments: { ...prev.comments, [appreciationId]: data || [] }
      }));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error loading comments",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [householdId, toast]);

  // Fetch reactions for a specific appreciation
  const fetchReactions = useCallback(async (appreciationId: string) => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('appreciation_reactions')
        .select('*')
        .eq('appreciation_id', appreciationId)
        .eq('household_id', householdId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        reactions: { ...prev.reactions, [appreciationId]: data || [] }
      }));
    } catch (error: any) {
      console.error('Error fetching reactions:', error);
      toast({
        title: "Error loading reactions",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [householdId, toast]);

  // Add appreciation with optimistic update
  const addAppreciation = useCallback(async (appreciationData: {
    message: string;
    to_member: string;
    to_user_id?: string;
  }) => {
    if (!householdId || !user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add appreciations",
        variant: "destructive"
      });
      return false;
    }

    // Find the target user ID if not provided
    let toUserId = appreciationData.to_user_id;
    if (!toUserId) {
      const targetMember = state.householdMembers.find(
        member => member.full_name === appreciationData.to_member
      );
      toUserId = targetMember?.id;
    }

    const newAppreciation = {
      message: appreciationData.message,
      to_member: appreciationData.to_member,
      from_member: currentUserName,
      household_id: householdId,
      from_user_id: user.id,
      to_user_id: toUserId || null,
    };

    try {
      const { error } = await supabase
        .from('appreciations')
        .insert([newAppreciation]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appreciation shared successfully!",
      });

      // Refresh appreciations
      fetchAppreciations();
      return true;
    } catch (error: any) {
      console.error('Error adding appreciation:', error);
      toast({
        title: "Error adding appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [householdId, user?.id, currentUserName, state.householdMembers, toast, fetchAppreciations]);

  // Toggle reaction with optimistic update
  const toggleReaction = useCallback(async (appreciationId: string) => {
    if (!householdId || !user?.id) return false;

    const currentReactions = state.reactions[appreciationId] || [];
    const userReaction = currentReactions.find(r => r.reactor_user_id === user.id);

    try {
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
            reactor_name: currentUserName,
            reactor_user_id: user.id
          }]);

        if (error) throw error;
      }

      // Refresh reactions and appreciations
      await Promise.all([
        fetchReactions(appreciationId),
        fetchAppreciations()
      ]);
      
      return true;
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Error updating reaction",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [householdId, user?.id, currentUserName, state.reactions, toast, fetchReactions, fetchAppreciations]);

  // Add comment
  const addComment = useCallback(async (appreciationId: string, comment: string) => {
    if (!householdId || !user?.id) return false;

    try {
      const { error } = await supabase
        .from('appreciation_comments')
        .insert([{
          appreciation_id: appreciationId,
          household_id: householdId,
          commenter_name: currentUserName,
          commenter_user_id: user.id,
          comment: comment
        }]);

      if (error) throw error;

      // Refresh comments and appreciations
      await Promise.all([
        fetchComments(appreciationId),
        fetchAppreciations()
      ]);
      
      return true;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [householdId, user?.id, currentUserName, toast, fetchComments, fetchAppreciations]);

  // Delete appreciation
  const deleteAppreciation = useCallback(async (id: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('appreciations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appreciation deleted successfully!",
      });

      fetchAppreciations();
      return true;
    } catch (error: any) {
      console.error('Error deleting appreciation:', error);
      toast({
        title: "Error deleting appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [user?.id, toast, fetchAppreciations]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!householdId) return;

    console.log('Setting up real-time subscriptions for household:', householdId);

    const channel = supabase
      .channel('appreciations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appreciations',
          filter: `household_id=eq.${householdId}`
        },
        () => {
          console.log('Appreciations changed, refreshing...');
          fetchAppreciations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appreciation_comments',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          console.log('Comments changed, refreshing...');
          const newRecord = payload.new as { appreciation_id?: string };
          if (newRecord?.appreciation_id) {
            fetchComments(newRecord.appreciation_id);
          }
          fetchAppreciations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appreciation_reactions',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          console.log('Reactions changed, refreshing...');
          const newRecord = payload.new as { appreciation_id?: string };
          if (newRecord?.appreciation_id) {
            fetchReactions(newRecord.appreciation_id);
          }
          fetchAppreciations();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [householdId, fetchAppreciations, fetchComments, fetchReactions]);

  // Initial data fetch
  useEffect(() => {
    if (householdId && user?.id) {
      Promise.all([
        fetchHouseholdMembers(),
        fetchAppreciations()
      ]);
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [householdId, user?.id, fetchHouseholdMembers, fetchAppreciations]);

  return {
    ...state,
    addAppreciation,
    toggleReaction,
    addComment,
    deleteAppreciation,
    fetchComments,
    fetchReactions,
    refetch: fetchAppreciations,
    currentUserName
  };
};
