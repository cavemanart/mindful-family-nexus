
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Info } from 'lucide-react';

interface SubscriptionLimitAlertProps {
  feature: string;
  currentPlan: string;
  isTrialActive?: boolean;
  onUpgrade?: () => void;
}

const SubscriptionLimitAlert: React.FC<SubscriptionLimitAlertProps> = ({
  feature,
  currentPlan,
  isTrialActive,
  onUpgrade
}) => {
  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Crown className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isTrialActive 
            ? `${feature} will be limited when your trial ends. Upgrade to keep unlimited access!`
            : `You've reached the ${feature} limit for the ${currentPlan} plan.`
          }
        </span>
        {onUpgrade && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUpgrade}
            className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Upgrade to Pro
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionLimitAlert;
