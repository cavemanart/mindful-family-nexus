import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChildren } from '@/hooks/useChildren';
import { toast } from 'sonner';
import { pushNotificationService } from '@/lib/push-notifications';

export interface MVPNomination {
  id: string;
  nominated_for: string;
  nominated_by: string;
  reason: string;
  emoji: string;
  nomination_date: string;
  nominated_for_user_id?: string;
  nominated_by_user_id?: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  full_name: string;
}

export const useMVPOfTheDay = (householdId: string | null) => {
  const { user, userProfile } = useAuth();
  const { children } = useChildren(householdId);
  const [todaysMVP, setTodaysMVP] = useState<MVPNomination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNominatedToday, setHasNominatedToday] = useState(false);

  // Create household members list from user profile and children
  const householdMembers: HouseholdMember[] = [
    ...(userProfile?.first_name ? [{ 
      id: userProfile.id, 
      name: userProfile.first_name,
      full_name: userProfile.first_name 
    }] : []),
    ...children.map(child => ({ 
      id: child.id, 
      name: child.first_name,
      full_name: child.first_name 
    }))
  ].filter(Boolean);

  const currentUserName = userProfile?.first_name || 'Family Member';

  const fetchTodaysMVP = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      const { data, error: fetchError } = await supabase
        .from('mvp_nominations')
        .select('*')
        .eq('household_id', householdId)
        .eq('nomination_date', today)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      setTodaysMVP(data?.[0] || null);

      // Check if current user has nominated today
      if (user?.id) {
        const { data: userNomination } = await supabase
          .from('mvp_nominations')
          .select('id')
          .eq('household_id', householdId)
          .eq('nominated_by_user_id', user.id)
          .eq('nomination_date', today)
          .limit(1);

        setHasNominatedToday(!!userNomination?.[0]);
      }

    } catch (err: any) {
      console.error('Error fetching MVP:', err);
      setError(err.message);
      toast.error('Failed to load MVP data');
    } finally {
      setLoading(false);
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
    await fetchTodaysMVP();
  };

  useEffect(() => {
    fetchTodaysMVP();
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
