
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  household_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  response_note?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export const useEventRSVPs = (eventId: string | null) => {
  const { user } = useAuth();
  const [rsvps, setRSVPs] = useState<EventRSVP[]>([]);
  const [userRSVP, setUserRSVP] = useState<EventRSVP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRSVPs = async () => {
    if (!eventId || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('👥 Fetching RSVPs for event:', eventId);

      const { data, error: fetchError } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at');

      if (fetchError) {
        console.error('❌ Error fetching RSVPs:', fetchError);
        setError('Failed to load RSVPs');
        toast.error('Failed to load RSVPs');
      } else {
        console.log('✅ RSVPs loaded:', data?.length || 0);
        setRSVPs(data || []);
        
        // Find current user's RSVP
        const currentUserRSVP = data?.find(rsvp => rsvp.user_id === user.id) || null;
        setUserRSVP(currentUserRSVP);
        
        setError(null);
      }
    } catch (error) {
      console.error('🚨 Error fetching RSVPs:', error);
      setError('Failed to load RSVPs');
      toast.error('Failed to load RSVPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && user) {
      fetchRSVPs();
    }
  }, [eventId, user]);

  const updateRSVP = async (
    status: 'pending' | 'accepted' | 'declined' | 'maybe',
    note?: string
  ) => {
    if (!user || !eventId) return null;

    try {
      console.log('📝 Updating RSVP status to:', status);

      let result;

      if (userRSVP) {
        // Update existing RSVP
        const { data, error } = await supabase
          .from('event_rsvps')
          .update({
            status,
            response_note: note,
            responded_at: new Date().toISOString(),
          })
          .eq('id', userRSVP.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new RSVP
        // First get the household_id from the event
        const { data: eventData, error: eventError } = await supabase
          .from('calendar_events')
          .select('household_id')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        const { data, error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id,
            household_id: eventData.household_id,
            status,
            response_note: note,
            responded_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      console.log('✅ RSVP updated successfully');
      toast.success('RSVP updated successfully');
      await fetchRSVPs(); // Refresh RSVPs
      return result;
    } catch (error) {
      console.error('🚨 Error updating RSVP:', error);
      toast.error('Failed to update RSVP');
      return null;
    }
  };

  const deleteRSVP = async () => {
    if (!user || !userRSVP) return false;

    try {
      console.log('🗑️ Deleting RSVP');

      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('id', userRSVP.id);

      if (error) throw error;

      console.log('✅ RSVP deleted successfully');
      toast.success('RSVP removed');
      await fetchRSVPs(); // Refresh RSVPs
      return true;
    } catch (error) {
      console.error('🚨 Error deleting RSVP:', error);
      toast.error('Failed to remove RSVP');
      return false;
    }
  };

  return {
    rsvps,
    userRSVP,
    loading,
    error,
    retry: fetchRSVPs,
    updateRSVP,
    deleteRSVP,
    refreshRSVPs: fetchRSVPs,
  };
};
