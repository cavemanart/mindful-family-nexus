
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Settings } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config';
import SubscriptionBadge from './SubscriptionBadge';

interface CurrentPlanCardProps {
  planType: string;
  trialActive: boolean;
  subscription: any;
  isPro: boolean;
  onManageSubscription: () => void;
}

const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  planType,
  trialActive,
  subscription,
  isPro,
  onManageSubscription
}) => (
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
          <Button variant="outline" onClick={onManageSubscription}>
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default CurrentPlanCard;
