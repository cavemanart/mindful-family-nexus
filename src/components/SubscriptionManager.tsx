
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholds } from '@/hooks/useHouseholds';
import { useHouseholdSubscription } from '@/hooks/useHouseholdSubscription';
import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config';
import SubscriptionBadge from './SubscriptionBadge';
import CurrentPlanCard from './CurrentPlanCard';
import UpgradeOptions from './UpgradeOptions';
import SubscriptionRefreshButton from './SubscriptionRefreshButton';

const SubscriptionManager: React.FC = () => {
  const { userProfile } = useAuth();
  const { selectedHousehold } = useHouseholds();
  const { subscriptionStatus, loading, isPro, refresh } = useHouseholdSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleUpgrade = async (planType: 'pro' | 'pro_annual') => {
    if (!userProfile || !subscriptionStatus.canManageSubscription) {
      alert('Only household owners can manage subscriptions.');
      return;
    }

    setCheckoutLoading(planType);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          plan_type: planType,
          household_id: selectedHousehold?.id 
        }
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
    if (!subscriptionStatus.canManageSubscription) {
      alert('Only household owners can manage subscriptions.');
      return;
    }

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

  // Show different content for non-owners when household has subscription
  if (subscriptionStatus.hasSubscription && !subscriptionStatus.canManageSubscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Subscription Status</h2>
          <SubscriptionBadge 
            planType={subscriptionStatus.planType}
            isTrialActive={subscriptionStatus.isTrialActive}
            trialEndDate={subscriptionStatus.subscriptionEndDate}
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            🎉 Your household has {SUBSCRIPTION_PLANS[subscriptionStatus.planType]?.name}!
          </h3>
          <p className="text-green-700">
            You have access to all Pro features as part of your household's subscription. 
            Only the household owner can manage subscription settings.
          </p>
          {subscriptionStatus.subscriptionEndDate && (
            <p className="text-sm text-green-600 mt-2">
              Subscription active until {new Date(subscriptionStatus.subscriptionEndDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  const planType = subscriptionStatus.planType;
  const trialActive = subscriptionStatus.isTrialActive;

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
        <h2 className="text-2xl font-bold">Household Subscription</h2>
        <SubscriptionBadge 
          planType={planType}
          isTrialActive={trialActive}
          trialEndDate={subscriptionStatus.subscriptionEndDate}
        />
      </div>

      {!subscriptionStatus.canManageSubscription && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Only household owners can manage subscription settings.
          </p>
        </div>
      )}

      {/* Current Plan */}
      <CurrentPlanCard
        planType={planType}
        trialActive={trialActive}
        subscription={subscriptionStatus}
        isPro={isPro}
        onManageSubscription={handleManageSubscription}
      />

      {/* Upgrade Options */}
      {!isPro && subscriptionStatus.canManageSubscription && (
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
        onRefresh={refresh}
        loading={loading}
      />
    </div>
  );
};

export default SubscriptionManager;
