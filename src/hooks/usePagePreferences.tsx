
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface PagePreference {
  id: string;
  user_id: string;
  page_key: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailablePage {
  key: string;
  label: string;
  description: string;
  category: 'core' | 'family' | 'management';
  alwaysVisible?: boolean;
}

export const AVAILABLE_PAGES: AvailablePage[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Main overview page', category: 'core', alwaysVisible: true },
  { key: 'appreciations', label: 'Appreciations', description: 'Send and receive thanks', category: 'family' },
  { key: 'bills', label: 'Bills Tracker', description: 'Manage household bills', category: 'management' },
  { key: 'notes', label: 'Family Notes', description: 'Shared family notes', category: 'family' },
  { key: 'calendar', label: 'Family Calendar', description: 'Household calendar and events', category: 'family' },
  { key: 'mental-load', label: 'Mental Load', description: 'Task management and planning', category: 'management' },
  { key: 'nanny-mode', label: 'Nanny Mode', description: 'Caregiver dashboard', category: 'management' },
  { key: 'children', label: 'Children Dashboard', description: 'Manage children profiles', category: 'family' },
  { key: 'weekly-sync', label: 'Weekly Goals', description: 'Set and track weekly goals', category: 'management' },
];

export const usePagePreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PagePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Fetching page preferences for user:', user.id);
      
      const fetchTimeout = setTimeout(() => {
        console.error('⏰ Page preferences fetch timeout');
        setError('Loading preferences took too long');
        setLoading(false);
      }, 8000);

      const { data, error: fetchError } = await supabase
        .from('user_page_preferences')
        .select('*')
        .eq('user_id', user.id);

      clearTimeout(fetchTimeout);

      if (fetchError) {
        console.error('❌ Error fetching page preferences:', fetchError);
        setError('Failed to load page preferences');
        toast({
          title: "Error",
          description: "Failed to load page preferences",
          variant: "destructive"
        });
      } else {
        console.log('✅ Page preferences loaded:', data?.length || 0);
        setPreferences(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('🚨 Error fetching page preferences:', error);
      setError('Failed to load page preferences');
      toast({
        title: "Error",
        description: "Failed to load page preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isPageVisible = (pageKey: string): boolean => {
    const preference = preferences.find(p => p.page_key === pageKey);
    return preference ? preference.is_visible : true;
  };

  const togglePageVisibility = async (pageKey: string) => {
    if (!user) return;

    const existingPreference = preferences.find(p => p.page_key === pageKey);
    const newVisibility = existingPreference ? !existingPreference.is_visible : false;

    try {
      if (existingPreference) {
        const { error } = await supabase
          .from('user_page_preferences')
          .update({ is_visible: newVisibility })
          .eq('id', existingPreference.id);

        if (error) throw error;

        setPreferences(prev => 
          prev.map(p => 
            p.id === existingPreference.id 
              ? { ...p, is_visible: newVisibility }
              : p
          )
        );
      } else {
        const { data, error } = await supabase
          .from('user_page_preferences')
          .insert({
            user_id: user.id,
            page_key: pageKey,
            is_visible: newVisibility,
          })
          .select()
          .single();

        if (error) throw error;

        setPreferences(prev => [...prev, data]);
      }

      toast({
        title: "Success",
        description: "Page visibility updated"
      });
    } catch (error) {
      console.error('Error updating page preference:', error);
      toast({
        title: "Error",
        description: "Failed to update page visibility",
        variant: "destructive"
      });
    }
  };

  const getVisiblePages = (pages: { key: string; [key: string]: any }[]) => {
    return pages.filter(page => isPageVisible(page.key));
  };

  return {
    preferences,
    loading,
    error,
    retry: fetchPreferences,
    isPageVisible,
    togglePageVisibility,
    getVisiblePages,
    availablePages: AVAILABLE_PAGES,
  };
};
