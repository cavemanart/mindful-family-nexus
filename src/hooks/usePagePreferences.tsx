
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChildSession } from '@/hooks/useChildSession';
import { useHouseholdSubscription } from '@/hooks/useHouseholdSubscription';
import { toast } from 'sonner';

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
  parentOnly?: boolean; // New field to mark parent-only pages
}

export const AVAILABLE_PAGES: AvailablePage[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Main overview page', category: 'core', alwaysVisible: true },
  { key: 'appreciations', label: 'Appreciations', description: 'Send and receive thanks', category: 'family' },
  { key: 'bills', label: 'Bills Tracker', description: 'Manage household bills', category: 'management', parentOnly: true },
  { key: 'notes', label: 'Family Notes', description: 'Shared family notes', category: 'family' },
  { key: 'calendar', label: 'Family Calendar', description: 'Household calendar and events', category: 'family' },
  { key: 'mental-load', label: 'Mental Load', description: 'Task management and planning', category: 'management', parentOnly: true },
  { key: 'nanny-mode', label: 'Nanny Mode', description: 'Caregiver dashboard', category: 'management', parentOnly: true },
  { key: 'children', label: 'Children Dashboard', description: 'Manage children profiles', category: 'family' },
  { key: 'weekly-sync', label: 'Weekly Goals', description: 'Set and track weekly goals', category: 'management' },
  { key: 'subscription', label: 'Subscription', description: 'Manage subscription and billing', category: 'management', parentOnly: true },
];

export const usePagePreferences = () => {
  const { user, userProfile } = useAuth();
  const { isChildMode } = useChildSession();
  const { subscriptionStatus } = useHouseholdSubscription();
  const [preferences, setPreferences] = useState<PagePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      // Set timeout for preferences fetch
      const fetchTimeout = setTimeout(() => {
        console.error('⏰ Page preferences fetch timeout');
        setError('Loading preferences took too long');
        setLoading(false);
      }, 8000); // 8 second timeout

      const { data, error: fetchError } = await supabase
        .from('user_page_preferences')
        .select('*')
        .eq('user_id', user.id);

      clearTimeout(fetchTimeout);

      if (fetchError) {
        console.error('❌ Error fetching page preferences:', fetchError);
        setError('Failed to load page preferences');
        toast.error('Failed to load page preferences');
      } else {
        console.log('✅ Page preferences loaded:', data?.length || 0);
        setPreferences(data || []);
        setError(null);
      }
    } catch (error) {
      console.error('🚨 Error fetching page preferences:', error);
      setError('Failed to load page preferences');
      toast.error('Failed to load page preferences');
    } finally {
      setLoading(false);
    }
  };

  const isPageVisible = (pageKey: string): boolean => {
    // Check if this is a parent-only page and user is a child
    const page = AVAILABLE_PAGES.find(p => p.key === pageKey);
    const isChild = isChildMode || userProfile?.role === 'child' || userProfile?.is_child_account;
    
    if (page?.parentOnly && isChild) {
      return false; // Hide parent-only pages from children
    }

    // Special handling for subscription page
    if (pageKey === 'subscription') {
      // Hide subscription page for children
      if (isChild) return false;
      
      // Hide subscription page for non-owners if household already has subscription
      if (subscriptionStatus.hasSubscription && !subscriptionStatus.canManageSubscription) {
        return false;
      }
      
      // Show subscription page for owners or when no household subscription exists
      return subscriptionStatus.canManageSubscription || !subscriptionStatus.hasSubscription;
    }

    const preference = preferences.find(p => p.page_key === pageKey);
    return preference ? preference.is_visible : true; // Default to visible
  };

  const togglePageVisibility = async (pageKey: string) => {
    if (!user) return;

    const existingPreference = preferences.find(p => p.page_key === pageKey);
    const newVisibility = existingPreference ? !existingPreference.is_visible : false;

    try {
      if (existingPreference) {
        // Update existing preference
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
        // Create new preference
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

      toast.success('Page visibility updated');
    } catch (error) {
      console.error('Error updating page preference:', error);
      toast.error('Failed to update page visibility');
    }
  };

  const getVisiblePages = (pages: { key: string; [key: string]: any }[]) => {
    return pages.filter(page => isPageVisible(page.key));
  };

  // Filter available pages for child users and subscription logic
  const getAvailablePagesForUser = () => {
    const isChild = isChildMode || userProfile?.role === 'child' || userProfile?.is_child_account;
    
    let availablePages = AVAILABLE_PAGES;
    
    if (isChild) {
      availablePages = availablePages.filter(page => !page.parentOnly);
    }
    
    // Filter subscription page based on household subscription status
    availablePages = availablePages.filter(page => {
      if (page.key === 'subscription') {
        if (isChild) return false;
        if (subscriptionStatus.hasSubscription && !subscriptionStatus.canManageSubscription) {
          return false;
        }
      }
      return true;
    });
    
    return availablePages;
  };

  return {
    preferences,
    loading,
    error,
    retry: fetchPreferences,
    isPageVisible,
    togglePageVisibility,
    getVisiblePages,
    availablePages: getAvailablePagesForUser(),
  };
};
