
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Gift, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserSubscription, isTrialActive } from '@/lib/subscription-utils';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config';
import SubscriptionBadge from './SubscriptionBadge';

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
      // First check our database
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPro ? <Crown className="h-5 w-5 text-purple-600" /> : <Gift className="h-5 w-5" />}
            Current Plan: {SUBSCRIPTION_PLANS[planType]?.name || 'Free Plan'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trialActive && planType === 'free' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">🎉 Trial Active!</p>
              <p className="text-green-700 text-sm mt-1">
                You have access to Pro features until {subscription.trial_end_date ? new Date(subscription.trial_end_date).toLocaleDateString() : 'trial expires'}.
              </p>
            </div>
          )}

          {isPro && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Subscription {subscription.is_active ? 'active' : 'inactive'}
                  {subscription.subscription_end_date && (
                    ` until ${new Date(subscription.subscription_end_date).toLocaleDateString()}`
                  )}
                </p>
              </div>
              <Button variant="outline" onClick={handleManageSubscription}>
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {!isPro && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Family Pro</span>
                <Badge variant="secondary">Most Popular</Badge>
              </CardTitle>
              <p className="text-2xl font-bold">$7.99<span className="text-sm font-normal">/month</span></p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>✅ Unlimited bill tracking</li>
                <li>✅ Unlimited "Vent" tasks</li>
                <li>✅ Advanced calendar features</li>
                <li>✅ Unlimited household members</li>
                <li>✅ Priority support</li>
                <li>✅ Mini-Coach Moments</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleUpgrade('pro')}
                disabled={checkoutLoading === 'pro'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {checkoutLoading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Family Pro Annual</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Best Value</Badge>
              </CardTitle>
              <p className="text-2xl font-bold">$69.99<span className="text-sm font-normal">/year</span></p>
              <p className="text-sm text-green-600">Save $26/year!</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>✅ All Pro features</li>
                <li>✅ Billed yearly for best value</li>
                <li>✅ Exclusive milestone recognition</li>
                <li>✅ Priority support</li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => handleUpgrade('pro_annual')}
                disabled={checkoutLoading === 'pro_annual'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {checkoutLoading === 'pro_annual' ? 'Processing...' : 'Upgrade to Annual'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refresh Button */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" onClick={loadSubscription} disabled={loading}>
            Refresh Subscription Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
