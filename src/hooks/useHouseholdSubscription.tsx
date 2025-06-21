
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { toast } from 'sonner';

interface HouseholdSubscriptionStatus {
  hasSubscription: boolean;
  planType: string;
  isTrialActive: boolean;
  subscriptionEndDate?: string;
  ownerUserId?: string;
  canManageSubscription: boolean;
}

export const useHouseholdSubscription = () => {
  const { user } = useAuth();
  const { selectedHousehold } = useHouseholds();
  const [subscriptionStatus, setSubscriptionStatus] = useState<HouseholdSubscriptionStatus>({
    hasSubscription: false,
    planType: 'free',
    isTrialActive: false,
    canManageSubscription: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedHousehold) {
      fetchHouseholdSubscription();
    } else {
      setLoading(false);
    }
  }, [user?.id, selectedHousehold?.id]);

  const fetchHouseholdSubscription = async () => {
    if (!user || !selectedHousehold) return;

    try {
      setLoading(true);

      // Get household subscription status
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .rpc('get_household_subscription_status', {
          p_household_id: selectedHousehold.id
        });

      if (subscriptionError) {
        console.error('Error fetching household subscription:', subscriptionError);
        toast.error('Failed to load subscription status');
        return;
      }

      // Check if user can manage subscription
      const { data: canManageData, error: canManageError } = await supabase
        .rpc('can_manage_household_subscription', {
          p_user_id: user.id,
          p_household_id: selectedHousehold.id
        });

      if (canManageError) {
        console.error('Error checking subscription management permissions:', canManageError);
      }

      const status = subscriptionData?.[0];
      setSubscriptionStatus({
        hasSubscription: status?.has_subscription || false,
        planType: status?.plan_type || 'free',
        isTrialActive: status?.is_trial_active || false,
        subscriptionEndDate: status?.subscription_end_date,
        ownerUserId: status?.owner_user_id,
        canManageSubscription: canManageData || false,
      });

    } catch (error) {
      console.error('Error in fetchHouseholdSubscription:', error);
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  const isPro = subscriptionStatus.planType === 'pro' || subscriptionStatus.planType === 'pro_annual';
  const hasProAccess = isPro || subscriptionStatus.isTrialActive;

  return {
    subscriptionStatus,
    loading,
    isPro,
    hasProAccess,
    refresh: fetchHouseholdSubscription,
  };
};
