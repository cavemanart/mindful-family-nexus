
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Child {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_selection: string;
  is_child_account: boolean;
  parent_id?: string;
  device_id?: string;
  created_at?: string;
}

export const useChildren = (householdId: string | undefined, allowUnauthenticated = false) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'SUBSCRIBED' | 'SUBSCRIPTION_ERROR' | 'disconnected'>('disconnected');
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  const fetchChildren = useCallback(async (showToast = false) => {
    if (!householdId || (!user?.id && !allowUnauthenticated)) {
      console.log('❌ useChildren: Missing householdId or user.id (and not allowUnauthenticated)');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 useChildren: Fetching children for household:', householdId);

      // First get all household members with their profiles
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          user_id,
          role,
          profiles (
            id,
            first_name,
            last_name,
            avatar_selection,
            is_child_account,
            parent_id,
            device_id,
            created_at,
            role
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('❌ useChildren: Error fetching household members:', error);
        throw error;
      }

      console.log('📊 useChildren: Raw household members data:', data);

      // Filter for child accounts
      const childrenData = data
        ?.map((member: any) => {
          const profile = member.profiles;
          
          if (!profile) {
            console.log('⚠️ useChildren: Member without profile:', member);
            return null;
          }

          // Check if this is a child account based on multiple criteria
          const isChild = profile.is_child_account === true || 
                          profile.role === 'child' || 
                          member.role === 'member'; // household members with 'member' role are typically children

          console.log('🔍 useChildren: Profile check:', {
            name: profile.first_name,
            is_child_account: profile.is_child_account,
            profile_role: profile.role,
            member_role: member.role,
            isChild
          });

          if (!isChild) return null;

          return {
            id: profile.id,
            first_name: profile.first_name || 'Unnamed',
            last_name: profile.last_name ?? null,
            avatar_selection: profile.avatar_selection || 'default',
            is_child_account: true,
            parent_id: profile.parent_id || undefined,
            device_id: profile.device_id || undefined,
            created_at: profile.created_at || undefined,
          } as Child;
        })
        .filter(Boolean) || [];

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
  }, [householdId, user?.id, retryCount, toast, allowUnauthenticated]);

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
            console.log('📡 useChildren: Realtime update received (household_members):', payload);
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
            const newRecord = payload.new as any;
            const oldRecord = payload.old as any;
            if (newRecord?.is_child_account || oldRecord?.is_child_account || newRecord?.role === 'child' || oldRecord?.role === 'child') {
              console.log('📡 useChildren: Realtime update received (profiles):', payload);
              fetchChildren();
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 useChildren: Subscription status:', status);

          if (status === 'SUBSCRIBED') {
            setSubscriptionStatus('SUBSCRIBED');
          } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
            setSubscriptionStatus('SUBSCRIPTION_ERROR');
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
    creating: false,
    refreshChildren,
    addOptimisticChild,
    createChild: undefined,
    isRefreshing,
    subscriptionStatus,
    lastFetchTime,
    retryCount
  };
};
