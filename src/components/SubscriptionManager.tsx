
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';

const SubscriptionManager: React.FC = () => {
  const { userProfile } = useAuth();
  const { selectedHousehold } = useHouseholds();
  const { subscriptionStatus, loading, isPro, refresh } = useHouseholdSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = async (planType: 'pro' | 'pro_annual') => {
    if (!userProfile || !subscriptionStatus.canManageSubscription) {
      toast.error('Only household owners can manage subscriptions.');
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

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecting to checkout...');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscriptionStatus.canManageSubscription) {
      toast.error('Only household owners can manage subscriptions.');
      return;
    }

    setPortalLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {}
      });

      if (error) {
        console.error('Customer portal error:', error);
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Opening subscription management...');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management. Please contact support if this continues.');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading subscription info...</p>
        </div>
      </div>
    );
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
          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Your household has {SUBSCRIPTION_PLANS[subscriptionStatus.planType]?.name}!
          </h3>
          <p className="text-green-700">
            You have access to all Pro features as part of your household's subscription. 
            Only the household owner can manage subscription settings.
          </p>
          {subscriptionStatus.subscriptionEndDate && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
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
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only household owners can manage subscription settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <CurrentPlanCard
        planType={planType}
        trialActive={trialActive}
        subscription={subscriptionStatus}
        isPro={isPro}
        onManageSubscription={handleManageSubscription}
      />

      {/* Subscription Management for Pro Users */}
      {isPro && subscriptionStatus.canManageSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Subscription Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage your subscription, update payment methods, view billing history, or make changes to your plan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleManageSubscription} 
                disabled={portalLoading}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {portalLoading ? 'Opening...' : 'Manage Subscription'}
              </Button>
              {planType === 'pro' && (
                <Button 
                  variant="outline" 
                  onClick={() => handleUpgrade('pro_annual')}
                  disabled={checkoutLoading === 'pro_annual'}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {checkoutLoading === 'pro_annual' ? 'Processing...' : `Upgrade to Annual (Save $${proAnnualSavings})`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
