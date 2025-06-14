
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SimpleCalendarEvent {
  id: string;
  household_id: string;
  creator_id: string;
  title: string;
  description?: string;
  start_datetime: string;
  created_at: string;
}

export const useSimpleCalendarEvents = (householdId: string | null) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SimpleCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!householdId || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📅 Fetching simple calendar events for household:', householdId);

      const { data, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('household_id', householdId)
        .order('start_datetime', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching calendar events:', fetchError);
        setError('Failed to load events');
        toast({
          title: "Error",
          description: "Failed to load events",
          variant: "destructive"
        });
      } else {
        console.log('✅ Calendar events loaded:', data?.length || 0);
        setEvents(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('🚨 Error fetching calendar events:', error);
      setError('Failed to load events');
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (householdId && user) {
      fetchEvents();
    }
  }, [householdId, user]);

  const createEvent = async (eventData: Omit<SimpleCalendarEvent, 'id' | 'creator_id' | 'created_at'>) => {
    if (!user || !householdId) return null;

    try {
      console.log('📝 Creating new calendar event:', eventData.title);

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          household_id: householdId,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating calendar event:', error);
        toast({
          title: "Error",
          description: "Failed to create event",
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Calendar event created:', data.id);
      toast({
        title: "Success",
        description: "Event created successfully"
      });
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('🚨 Error creating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<SimpleCalendarEvent>) => {
    if (!user) return null;

    try {
      console.log('📝 Updating calendar event:', eventId);

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating calendar event:', error);
        toast({
          title: "Error",
          description: "Failed to update event",
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Calendar event updated:', data.id);
      toast({
        title: "Success",
        description: "Event updated successfully"
      });
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('🚨 Error updating calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      console.log('🗑️ Deleting calendar event:', eventId);

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('❌ Error deleting calendar event:', error);
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Calendar event deleted');
      toast({
        title: "Success",
        description: "Event deleted successfully"
      });
      await fetchEvents();
      return true;
    } catch (error) {
      console.error('🚨 Error deleting calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
  };
};
