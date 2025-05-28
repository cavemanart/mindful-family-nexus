
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Appreciation {
  id: string;
  message: string;
  from_member: string;
  to_member: string;
  reactions: number;
  created_at: string;
  household_id: string;
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

export const useAppreciations = (householdId: string | null) => {
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [comments, setComments] = useState<{ [key: string]: AppreciationComment[] }>({});
  const [reactions, setReactions] = useState<{ [key: string]: AppreciationReaction[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppreciations(data || []);
    } catch (error: any) {
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

  const addAppreciation = async (appreciationData: Omit<Appreciation, 'id' | 'created_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('appreciations')
        .insert([{ ...appreciationData, household_id: householdId }]);

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

  const toggleReaction = async (appreciationId: string, reactorName: string) => {
    if (!householdId) return false;

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
    fetchAppreciations();
  }, [householdId]);

  return {
    appreciations,
    comments,
    reactions,
    loading,
    addAppreciation,
    updateAppreciation,
    toggleReaction,
    addComment,
    fetchComments,
    fetchReactions,
    refetch: fetchAppreciations
  };
};
