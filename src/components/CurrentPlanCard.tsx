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

// This component is now deprecated and consolidated into SubscriptionManager
// Keeping for backward compatibility but functionality moved to main component
const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({
  planType,
  trialActive,
  subscription,
  isPro,
  onManageSubscription
}) => {
  console.log('⚠️ CurrentPlanCard is deprecated - functionality moved to SubscriptionManager');
  
  return (
    <Card className="opacity-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPro ? <Crown className="h-5 w-5 text-purple-600" /> : <Gift className="h-5 w-5" />}
          Deprecated Component - See SubscriptionManager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This component has been consolidated into SubscriptionManager to fix duplicate buttons.
        </p>
      </CardContent>
    </Card>
  );
};

export default CurrentPlanCard;
