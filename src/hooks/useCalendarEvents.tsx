import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CalendarEvent {
  id: string;
  household_id: string;
  creator_id: string;
  title: string;
  description?: string;
  event_type: 'task' | 'meeting' | 'milestone' | 'appointment' | 'reminder' | 'social' | 'sync';
  start_datetime: string;
  end_datetime?: string;
  all_day: boolean;
  color: string;
  location?: string;
  assigned_to?: string[];
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  household_id: string;
  name: string;
  type_key: 'task' | 'meeting' | 'milestone' | 'appointment' | 'reminder' | 'social' | 'sync';
  icon: string;
  color: string;
  description?: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  household_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  response_note?: string;
  responded_at?: string;
}

export const useCalendarEvents = (householdId: string | null) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!householdId || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📅 Fetching calendar events for household:', householdId);

      const { data, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('household_id', householdId)
        .order('start_datetime', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching calendar events:', fetchError);
        setError('Failed to load calendar events');
        toast.error('Failed to load calendar events');
      } else {
        console.log('✅ Calendar events loaded:', data?.length || 0);
        setEvents(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('🚨 Error fetching calendar events:', error);
      setError('Failed to load calendar events');
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    if (!householdId || !user) return;

    try {
      console.log('🏷️ Fetching event types for household:', householdId);

      const { data, error: fetchError } = await supabase
        .from('event_types')
        .select('*')
        .eq('household_id', householdId)
        .order('name');

      if (fetchError) {
        console.error('❌ Error fetching event types:', fetchError);
        toast.error('Failed to load event types');
      } else {
        console.log('✅ Event types loaded:', data?.length || 0);
        setEventTypes(data || []);
      }
    } catch (error) {
      console.error('🚨 Error fetching event types:', error);
      toast.error('Failed to load event types');
    }
  };

  useEffect(() => {
    if (householdId && user) {
      fetchEvents();
      fetchEventTypes();
    }
  }, [householdId, user]);

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => {
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
        toast.error('Failed to create event');
        return null;
      }

      console.log('✅ Calendar event created:', data.id);
      toast.success('Event created successfully');
      await fetchEvents(); // Refresh events
      return data;
    } catch (error) {
      console.error('🚨 Error creating calendar event:', error);
      toast.error('Failed to create event');
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
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
        toast.error('Failed to update event');
        return null;
      }

      console.log('✅ Calendar event updated:', data.id);
      toast.success('Event updated successfully');
      await fetchEvents(); // Refresh events
      return data;
    } catch (error) {
      console.error('🚨 Error updating calendar event:', error);
      toast.error('Failed to update event');
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
        toast.error('Failed to delete event');
        return false;
      }

      console.log('✅ Calendar event deleted');
      toast.success('Event deleted successfully');
      await fetchEvents(); // Refresh events
      return true;
    } catch (error) {
      console.error('🚨 Error deleting calendar event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  };

  return {
    events,
    eventTypes,
    loading,
    error,
    retry: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
    refreshEventTypes: fetchEventTypes,
  };
};
