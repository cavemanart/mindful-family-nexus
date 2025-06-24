
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Settings, Calendar } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-config';

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
            You have access to Pro features until {subscription.subscriptionEndDate ? new Date(subscription.subscriptionEndDate).toLocaleDateString() : 'trial expires'}.
          </p>
        </div>
      )}

      {isPro && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {planType === 'pro_annual' ? 'Annual Subscription' : 'Monthly Subscription'}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {subscription.subscriptionEndDate && (
                  `Active until ${new Date(subscription.subscriptionEndDate).toLocaleDateString()}`
                )}
              </p>
            </div>
          </div>
          
          {subscription.canManageSubscription && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Use the management portal to cancel, change payment methods, or view billing history.
              </p>
              <Button variant="outline" onClick={onManageSubscription} size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default CurrentPlanCard;
