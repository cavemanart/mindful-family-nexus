import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { pushNotificationService } from '@/lib/push-notifications';

export interface MVPNomination {
  id: string;
  household_id: string;
  nominated_by: string;
  nominated_for: string;
  reason: string;
  emoji: string;
  created_at: string;
  nomination_date: string;
  nominated_by_user_id?: string;
  nominated_for_user_id?: string;
}

export interface HouseholdMember {
  id: string;
  full_name: string;
}

export const useMVPOfTheDay = (householdId?: string) => {
  const { user, userProfile } = useAuth();
  const [todaysMVP, setTodaysMVP] = useState<MVPNomination | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNominatedToday, setHasNominatedToday] = useState(false);

  const currentUserName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}` 
    : user?.email || 'Unknown User';

  const fetchHouseholdMembers = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          user_id,
          profiles!inner(id, first_name, last_name, is_child_account)
        `)
        .eq('household_id', householdId);

      if (error) throw error;

      const members = data.map(member => ({
        id: member.user_id,
        full_name: `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.trim() || 'Unknown User'
      }));

      setHouseholdMembers(members);
    } catch (error) {
      console.error('Error fetching household members:', error);
      setError('Failed to load household members');
    }
  };

  const fetchTodaysMVP = async () => {
    if (!householdId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Try to get today's MVP first
      let { data: todayData, error: todayError } = await supabase
        .from('mvp_nominations')
        .select('*')
        .eq('household_id', householdId)
        .eq('nomination_date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (todayError) throw todayError;

      // If no MVP for today, try yesterday
      if (!todayData || todayData.length === 0) {
        const { data: yesterdayData, error: yesterdayError } = await supabase
          .from('mvp_nominations')
          .select('*')
          .eq('household_id', householdId)
          .eq('nomination_date', yesterday)
          .order('created_at', { ascending: false })
          .limit(1);

        if (yesterdayError) throw yesterdayError;
        setTodaysMVP(yesterdayData?.[0] || null);
      } else {
        setTodaysMVP(todayData[0]);
      }

      // Check if current user has nominated today
      if (user?.id) {
        const { data: userNomination, error: nominationError } = await supabase
          .from('mvp_nominations')
          .select('id')
          .eq('household_id', householdId)
          .eq('nominated_by_user_id', user.id)
          .eq('nomination_date', today)
          .limit(1);

        if (nominationError) throw nominationError;
        setHasNominatedToday((userNomination?.length || 0) > 0);
      }

    } catch (error) {
      console.error('Error fetching MVP:', error);
      setError('Failed to load MVP data');
    }
  };

  const nominateMVP = async (data: { nominated_for: string; nominated_for_user_id: string; reason: string; emoji: string }) => {
    if (!householdId || !user?.id) {
      toast.error('Unable to nominate MVP');
      return false;
    }

    if (hasNominatedToday) {
      toast.error('You have already nominated someone today!');
      return false;
    }

    try {
      const { error } = await supabase
        .from('mvp_nominations')
        .insert({
          household_id: householdId,
          nominated_by: currentUserName,
          nominated_by_user_id: user.id,
          nominated_for: data.nominated_for,
          nominated_for_user_id: data.nominated_for_user_id,
          reason: data.reason,
          emoji: data.emoji,
          nomination_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast.success(`🏆 ${data.nominated_for} has been nominated as MVP!`);
      
      // Send push notification for MVP announcement
      try {
        await pushNotificationService.sendMVPAnnouncement(data.nominated_for);
      } catch (notifError) {
        console.warn('Failed to send MVP notification:', notifError);
      }
      
      await fetchTodaysMVP();
      return true;
    } catch (error: any) {
      console.error('Error nominating MVP:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        toast.error('You have already nominated someone today!');
        setHasNominatedToday(true);
      } else {
        toast.error('Failed to nominate MVP');
      }
      return false;
    }
  };

  const refreshMVP = async () => {
    setLoading(true);
    await fetchTodaysMVP();
    setLoading(false);
  };

  useEffect(() => {
    if (householdId && user) {
      const initialize = async () => {
        setLoading(true);
        setError(null);
        await Promise.all([fetchHouseholdMembers(), fetchTodaysMVP()]);
        setLoading(false);
      };

      initialize();

      // Set up real-time subscription
      const channel = supabase
        .channel('mvp_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mvp_nominations',
            filter: `household_id=eq.${householdId}`
          },
          () => {
            fetchTodaysMVP();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [householdId, user?.id]);

  return {
    todaysMVP,
    householdMembers,
    loading,
    error,
    hasNominatedToday,
    currentUserName,
    nominateMVP,
    refreshMVP
  };
};
