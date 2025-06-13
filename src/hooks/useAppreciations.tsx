import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Appreciation {
  id: string;
  message: string;
  from_member: string;
  to_member: string;
  reactions: number;
  created_at: string;
  household_id: string;
  archived: boolean;
  archived_at?: string;
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

  const currentUserName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Unknown User';

  const fetchHouseholdMembers = async () => {
    if (!householdId) {
      console.log('❌ No household ID provided for fetching members');
      return;
    }

    try {
      console.log('🔍 Fetching household members for household:', householdId);
      
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
        console.error('❌ Error fetching household members:', error);
        throw error;
      }
      
      console.log('📊 Raw household members data:', data);
      
      // Filter out members with null profiles and log warnings
      const validMembers = data?.filter(member => {
        if (!member.profiles) {
          console.warn('⚠️ Found household member with null profile:', member.id);
          return false;
        }
        return true;
      }) || [];
      
      console.log('✅ Valid household members:', validMembers.length, 'out of', data?.length || 0);
      
      const members = validMembers.map(member => ({
        id: member.profiles.id,
        first_name: member.profiles.first_name || 'Unknown',
        last_name: member.profiles.last_name || 'User',
        role: member.profiles.role || 'member'
      }));
      
      console.log('👥 Processed household members:', members);
      setHouseholdMembers(members);
    } catch (error: any) {
      console.error('🚨 Error in fetchHouseholdMembers:', error);
      toast({
        title: "Error fetching family members",
        description: `${error.message || 'Unknown error occurred'}. Some data may be inconsistent.`,
        variant: "destructive"
      });
      
      // Set empty array on error to prevent crashes
      setHouseholdMembers([]);
    }
  };

  const fetchAppreciations = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appreciations')
        .select('*')
        .eq('household_id', householdId)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppreciations(data || []);
    } catch (error: any) {
      console.error('Error fetching appreciations:', error);
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
    if (!householdId) return;

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
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchReactions = async (appreciationId: string) => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('appreciation_reactions')
        .select('*')
        .eq('appreciation_id', appreciationId)
        .eq('household_id', householdId);

      if (error) throw error;
      setReactions(prev => ({ ...prev, [appreciationId]: data || [] }));
    } catch (error: any) {
      toast({
        title: "Error fetching reactions",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addAppreciation = async (appreciationData: Omit<Appreciation, 'id' | 'created_at' | 'household_id' | 'from_member' | 'archived' | 'archived_at'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('appreciations')
        .insert([{ 
          ...appreciationData, 
          household_id: householdId,
          from_member: currentUserName
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appreciation shared successfully!",
      });
      
      fetchAppreciations();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updateAppreciation = async (id: string, updates: Partial<Appreciation>) => {
    try {
      const { error } = await supabase
        .from('appreciations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Appreciation updated successfully!",
      });
      
      fetchAppreciations();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteAppreciation = async (id: string) => {
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
      toast({
        title: "Error deleting appreciation",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const archiveOldAppreciations = async () => {
    try {
      const { data, error } = await supabase.rpc('archive_old_appreciations');
      
      if (error) throw error;
      
      if (data > 0) {
        toast({
          title: "Appreciations archived",
          description: `${data} old appreciation(s) have been archived.`,
        });
        fetchAppreciations();
      }
      
      return data;
    } catch (error: any) {
      console.error('Error archiving old appreciations:', error);
      return 0;
    }
  };

  const toggleReaction = async (appreciationId: string, reactorName: string) => {
    if (!householdId) return false;

    try {
      const existingReactions = reactions[appreciationId] || [];
      const userReaction = existingReactions.find(r => r.reactor_name === reactorName);

      if (userReaction) {
        const { error } = await supabase
          .from('appreciation_reactions')
          .delete()
          .eq('id', userReaction.id);

        if (error) throw error;
      } else {
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
      toast({
        title: "Error updating reaction",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const addComment = async (appreciationId: string, commenterName: string, comment: string) => {
    if (!householdId) return false;

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
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    console.log('🔄 useAppreciations effect triggered, householdId:', householdId);
    fetchAppreciations();
    fetchHouseholdMembers();
    
    if (householdId) {
      archiveOldAppreciations();
    }
  }, [householdId]);

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
    archiveOldAppreciations,
    refetch: fetchAppreciations
  };
};
