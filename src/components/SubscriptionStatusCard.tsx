
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Settings, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserSubscription, isTrialActive } from '@/lib/subscription-utils';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config';
import SubscriptionBadge from './SubscriptionBadge';
import TrialActivation from './TrialActivation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SubscriptionStatusCard: React.FC = () => {
  const { userProfile } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscription();
  }, [userProfile?.id]);

  const loadSubscription = async () => {
    if (!userProfile?.id) return;

    try {
      const sub = await getUserSubscription(userProfile.id);
      setSubscription(sub);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'pro' | 'pro_annual') => {
    if (!userProfile) return;

    setUpgradeLoading(planType);
    
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
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading subscription...</div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No subscription found
          </div>
        </CardContent>
      </Card>
    );
  }

  const planType = subscription.plan_type || 'free';
  const trialActive = isTrialActive(subscription);
  const isPro = planType === 'pro' || planType === 'pro_annual';
  const canStartTrial = planType === 'free' && !subscription.trial_start_date;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isPro ? <Crown className="h-5 w-5 text-purple-600" /> : <Gift className="h-5 w-5" />}
              Subscription Status
            </span>
            <SubscriptionBadge 
              planType={planType}
              isTrialActive={trialActive}
              trialEndDate={subscription.trial_end_date}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">{SUBSCRIPTION_PLANS[planType]?.name || 'Free Plan'}</h3>
            {trialActive && (
              <p className="text-sm text-green-600 mt-1">
                Trial active until {subscription.trial_end_date ? new Date(subscription.trial_end_date).toLocaleDateString() : 'trial expires'}
              </p>
            )}
          </div>

          {!isPro && !trialActive && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUpgrade('pro')}
                disabled={upgradeLoading === 'pro'}
              >
                {upgradeLoading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleUpgrade('pro_annual')}
                disabled={upgradeLoading === 'pro_annual'}
              >
                {upgradeLoading === 'pro_annual' ? 'Processing...' : 'Annual Pro'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {canStartTrial && (
        <TrialActivation 
          userId={userProfile.id}
          onTrialStarted={loadSubscription}
        />
      )}
    </div>
  );
};

export default SubscriptionStatusCard;
