
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MiniCoachMoment {
  id: string;
  household_id: string;
  content: string;
  coaching_type: string;
  generated_for_date: string;
  is_read: boolean;
  created_at: string;
  expires_at: string;
  is_daily_auto: boolean;
}

export const useMiniCoach = (householdId: string | null) => {
  const [moments, setMoments] = useState<MiniCoachMoment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMoments = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch daily coaching moments (only show current day's moment)
      const { data, error } = await supabase
        .from('mini_coach_moments')
        .select('*')
        .eq('household_id', householdId)
        .eq('generated_for_date', new Date().toISOString().split('T')[0])
        .eq('is_daily_auto', true)
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

  const generateDailyMoment = async () => {
    if (!householdId) return;

    try {
      console.log('Generating daily coaching moment for household:', householdId);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-coach', {
        body: { householdId }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate daily coaching insight');
      }
      
      console.log('Daily coaching moment generated successfully:', data);
      await fetchMoments();
    } catch (error: any) {
      console.error('Error generating daily moment:', error);
    }
  };

  useEffect(() => {
    fetchMoments();
    // Auto-generate daily moment when component loads
    if (householdId) {
      generateDailyMoment();
    }
  }, [householdId]);

  return {
    moments,
    loading,
    markAsRead,
    refetch: fetchMoments
  };
};
