
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { AdvancedCalendarEvent, EventCategory } from '@/types/calendar';

export const useAdvancedCalendar = (householdId: string | null) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<AdvancedCalendarEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!householdId || !user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📅 Fetching advanced calendar events for household:', householdId);

      const { data, error: fetchError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('household_id', householdId)
        .order('start_datetime', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching calendar events:', fetchError);
        setError('Failed to load events');
        toast.error('Failed to load events');
      } else {
        console.log('✅ Advanced calendar events loaded:', data?.length || 0);
        setEvents(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('🚨 Error fetching calendar events:', error);
      setError('Failed to load events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!householdId || !user) return;

    try {
      console.log('🏷️ Fetching event categories for household:', householdId);

      const { data, error: fetchError } = await supabase
        .from('event_categories')
        .select('*')
        .eq('household_id', householdId)
        .order('name', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching categories:', fetchError);
        toast.error('Failed to load categories');
      } else {
        console.log('✅ Categories loaded:', data?.length || 0);
        setCategories(data || []);
      }
    } catch (error) {
      console.error('🚨 Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    if (householdId && user) {
      fetchEvents();
      fetchCategories();
    }
  }, [householdId, user]);

  const createEvent = async (eventData: Omit<AdvancedCalendarEvent, 'id' | 'creator_id' | 'created_at'>) => {
    if (!user || !householdId) return null;

    try {
      console.log('📝 Creating new advanced calendar event:', eventData.title);

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

      console.log('✅ Advanced calendar event created:', data.id);
      toast.success('Event created successfully');
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('🚨 Error creating calendar event:', error);
      toast.error('Failed to create event');
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<AdvancedCalendarEvent>) => {
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
      await fetchEvents();
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
      await fetchEvents();
      return true;
    } catch (error) {
      console.error('🚨 Error deleting calendar event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  };

  return {
    events,
    categories,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
    refreshCategories: fetchCategories,
  };
};
