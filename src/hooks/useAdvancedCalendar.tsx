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

  const createEvent = async (eventData: Omit<AdvancedCalendarEvent, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !householdId) {
      console.error('❌ Missing user or householdId for event creation');
      toast.error('Authentication required to create event');
      return null;
    }

    try {
      console.log('📝 Creating new advanced calendar event:', eventData.title);
      console.log('📝 Event data being sent:', JSON.stringify(eventData, null, 2));

      // Clean the data to ensure it matches the database schema
      const cleanEventData = {
        title: eventData.title,
        description: eventData.description || null,
        start_datetime: eventData.start_datetime,
        end_datetime: eventData.end_datetime || null,
        category: eventData.category || null,
        color: eventData.color || null,
        assigned_to: Array.isArray(eventData.assigned_to) ? eventData.assigned_to : [],
        is_recurring: eventData.is_recurring || false,
        recurrence_pattern: eventData.recurrence_pattern || null,
        recurrence_end: eventData.recurrence_end || null,
        household_id: householdId,
        creator_id: user.id,
      };

      console.log('📝 Cleaned event data:', JSON.stringify(cleanEventData, null, 2));

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(cleanEventData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error creating calendar event:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        toast.error(`Failed to create event: ${error.message}`);
        return null;
      }

      console.log('✅ Advanced calendar event created:', data.id);
      toast.success('Event created successfully');
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('🚨 Unexpected error creating calendar event:', error);
      toast.error('Failed to create event due to unexpected error');
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<AdvancedCalendarEvent>) => {
    if (!user) {
      console.error('❌ No user for event update');
      toast.error('Authentication required to update event');
      return null;
    }

    try {
      console.log('📝 Updating calendar event:', eventId);
      console.log('📝 Update data received:', JSON.stringify(updates, null, 2));

      // Clean the update data to ensure proper types and remove undefined values
      const cleanUpdates: any = {};
      
      // Only include fields that should be updated
      const allowedFields = [
        'title', 'description', 'start_datetime', 'end_datetime', 
        'category', 'color', 'assigned_to', 'is_recurring', 
        'recurrence_pattern', 'recurrence_end'
      ];

      allowedFields.forEach(field => {
        if (field in updates) {
          const value = updates[field as keyof AdvancedCalendarEvent];
          
          // Handle specific field types
          if (field === 'assigned_to') {
            cleanUpdates[field] = Array.isArray(value) ? value : [];
          } else if (field === 'is_recurring') {
            cleanUpdates[field] = Boolean(value);
          } else if (value === undefined || value === '') {
            cleanUpdates[field] = null;
          } else {
            cleanUpdates[field] = value;
          }
        }
      });

      // Ensure recurrence_pattern is null if not recurring
      if (cleanUpdates.is_recurring === false) {
        cleanUpdates.recurrence_pattern = null;
        cleanUpdates.recurrence_end = null;
      }

      console.log('📝 Cleaned update data:', JSON.stringify(cleanUpdates, null, 2));

      const { data, error } = await supabase
        .from('calendar_events')
        .update(cleanUpdates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error updating calendar event:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        toast.error(`Failed to update event: ${error.message}`);
        return null;
      }

      console.log('✅ Calendar event updated successfully:', data.id);
      toast.success('Event updated successfully');
      await fetchEvents();
      return data;
    } catch (error) {
      console.error('🚨 Unexpected error updating calendar event:', error);
      toast.error('Failed to update event due to unexpected error');
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
