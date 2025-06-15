
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserSubscription, isTrialActive } from '@/lib/subscription-utils';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config';
import SubscriptionBadge from './SubscriptionBadge';
import CurrentPlanCard from './CurrentPlanCard';
import UpgradeOptions from './UpgradeOptions';
import SubscriptionRefreshButton from './SubscriptionRefreshButton';

const SubscriptionManager: React.FC = () => {
  const { userProfile } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, [userProfile?.id]);

  const loadSubscription = async () => {
    if (!userProfile?.id) return;

    try {
      let sub = await getUserSubscription(userProfile.id);

      // Then verify with Stripe
      const { data, error } = await supabase.functions.invoke('check-subscription-status');
      if (!error && data) {
        setSubscription(data);
      } else {
        setSubscription(sub);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'pro' | 'pro_annual') => {
    if (!userProfile) return;

    setCheckoutLoading(planType);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan_type: planType }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Failed to open subscription management. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading subscription info...</div>;
  }

  const planType = subscription?.plan_type || 'free';
  const trialActive = subscription ? isTrialActive(subscription) : false;
  const isPro = planType === 'pro' || planType === 'pro_annual';

  // Get prices from config (stored in cents, so divide by 100)
  const proPrice = (SUBSCRIPTION_PLANS.pro.price / 100).toFixed(2);
  const proAnnualPrice = (SUBSCRIPTION_PLANS.pro_annual.price / 100).toFixed(2);

  // Calculate Pro Annual savings: (monthly pro x 12 - annual pro)
  const proAnnualSavings = (
    SUBSCRIPTION_PLANS.pro.price * 12 / 100 -
    SUBSCRIPTION_PLANS.pro_annual.price / 100
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription</h2>
        <SubscriptionBadge 
          planType={planType}
          isTrialActive={trialActive}
          trialEndDate={subscription?.trial_end_date}
        />
      </div>

      {/* Current Plan */}
      <CurrentPlanCard
        planType={planType}
        trialActive={trialActive}
        subscription={subscription}
        isPro={isPro}
        onManageSubscription={handleManageSubscription}
      />

      {/* Upgrade Options */}
      {!isPro && (
        <UpgradeOptions
          proPrice={proPrice}
          proAnnualPrice={proAnnualPrice}
          proAnnualSavings={proAnnualSavings}
          checkoutLoading={checkoutLoading}
          onUpgrade={handleUpgrade}
        />
      )}

      {/* Refresh Button */}
      <SubscriptionRefreshButton
        onRefresh={loadSubscription}
        loading={loading}
      />
    </div>
  );
};

export default SubscriptionManager;
