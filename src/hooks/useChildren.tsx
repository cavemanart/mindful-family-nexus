import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  avatar_selection: string;
  is_child_account: boolean;
  parent_id?: string;
}

export const useChildren = (householdId: string | undefined) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'SUBSCRIBED' | 'SUBSCRIPTION_ERROR' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const fetchChildren = useCallback(async (showToast = false) => {
    if (!householdId || !user?.id) {
      console.log('❌ useChildren: Missing householdId or user.id');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 useChildren: Fetching children for household:', householdId);
      
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_selection,
            is_child_account,
            parent_id
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('❌ useChildren: Error fetching children:', error);
        throw error;
      }

      console.log('📊 useChildren: Raw data from query:', data);

      const childrenData = data
        ?.map(member => member.profiles)
        .filter((profile): profile is Child => 
          profile !== null && 
          profile.is_child_account === true
        ) || [];

      console.log('👶 useChildren: Filtered children:', childrenData);
      setChildren(childrenData);
      setLastFetchTime(new Date());
      setRetryCount(0);

      if (showToast) {
        toast({
          title: "Success",
          description: `Found ${childrenData.length} children`,
        });
      }

    } catch (error: any) {
      console.error('❌ useChildren: Fetch error:', error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 useChildren: Retrying fetch (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchChildren(showToast), RETRY_DELAY * Math.pow(2, retryCount));
      } else {
        toast({
          title: "Error fetching children",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [householdId, user?.id, retryCount, toast]);

  const addOptimisticChild = useCallback((newChild: Omit<Child, 'id'>) => {
    const optimisticChild: Child = {
      ...newChild,
      id: `temp-${Date.now()}`,
    };

    console.log('➕ useChildren: Adding optimistic child:', optimisticChild);
    setChildren(prev => {
      const updated = [...prev, optimisticChild];
      console.log('📝 useChildren: Updated children list:', updated);
      return updated;
    });

    return optimisticChild.id;
  }, []);

  const refreshChildren = useCallback(async () => {
    console.log('🔄 useChildren: Manual refresh triggered');
    setIsRefreshing(true);
    await fetchChildren(true);
  }, [fetchChildren]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!householdId) {
      console.log('❌ useChildren: No householdId, skipping subscription');
      return;
    }

    console.log('📡 useChildren: Setting up realtime subscription for household:', householdId);
    setSubscriptionStatus('connecting');

    try {
      const channel = supabase
        .channel(`household-members-${householdId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'household_members',
            filter: `household_id=eq.${householdId}`
          },
          (payload) => {
            console.log('📡 useChildren: Realtime update received:', payload);
            fetchChildren();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('📡 useChildren: Profile update received:', payload);
            if (payload.new?.is_child_account || payload.old?.is_child_account) {
              fetchChildren();
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 useChildren: Subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setSubscriptionStatus('SUBSCRIBED');
            console.log('✅ useChildren: Successfully subscribed to realtime updates');
          } else if (status === 'SUBSCRIPTION_ERROR') {
            setSubscriptionStatus('SUBSCRIPTION_ERROR');
            console.error('❌ useChildren: Subscription error');
          }
        });

      return () => {
        console.log('🔌 useChildren: Cleaning up subscription');
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error('❌ useChildren: Error setting up subscription:', error);
      setSubscriptionStatus('SUBSCRIPTION_ERROR');
    }
  }, [householdId, fetchChildren]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [setupRealtimeSubscription]);

  return {
    children,
    loading,
    refreshChildren,
    addOptimisticChild,
    isRefreshing,
    subscriptionStatus,
    lastFetchTime,
    retryCount
  };
};
