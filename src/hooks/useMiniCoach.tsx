
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MiniCoachMoment {
  id: string;
  household_id: string;
  content: string;
  coaching_type: string;
  generated_for_week: string;
  is_read: boolean;
  created_at: string;
  expires_at: string;
}

export const useMiniCoach = (householdId: string | null) => {
  const [moments, setMoments] = useState<MiniCoachMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchMoments = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mini_coach_moments')
        .select('*')
        .eq('household_id', householdId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMoments(data || []);
    } catch (error: any) {
      console.error('Error fetching coach moments:', error);
      toast.error('Failed to load coaching moments');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (momentId: string) => {
    try {
      const { error } = await supabase
        .from('mini_coach_moments')
        .update({ is_read: true })
        .eq('id', momentId);

      if (error) throw error;
      
      setMoments(prev => 
        prev.map(moment => 
          moment.id === momentId 
            ? { ...moment, is_read: true }
            : moment
        )
      );
    } catch (error: any) {
      console.error('Error marking moment as read:', error);
    }
  };

  const generateNewMoments = async () => {
    if (!householdId || generating) return;

    setGenerating(true);
    try {
      console.log('Generating new coaching moments for household:', householdId);
      
      const { data, error } = await supabase.functions.invoke('generate-mini-coach', {
        body: { householdId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate coaching insights');
      }
      
      console.log('Coaching moments generated successfully:', data);
      toast.success('New coaching insights generated!');
      await fetchMoments();
    } catch (error: any) {
      console.error('Error generating moments:', error);
      toast.error('Failed to generate coaching insights: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, [householdId]);

  return {
    moments,
    loading,
    generating,
    markAsRead,
    generateNewMoments,
    refetch: fetchMoments
  };
};
