
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Crown, Gift } from 'lucide-react';

interface SubscriptionBadgeProps {
  planType: string;
  isTrialActive?: boolean;
  trialEndDate?: string;
  className?: string;
}

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  planType,
  isTrialActive,
  trialEndDate,
  className = ""
}) => {
  if (isTrialActive && planType === 'free') {
    const daysLeft = trialEndDate 
      ? Math.ceil((new Date(trialEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    return (
      <Badge variant="secondary" className={`bg-green-100 text-green-800 ${className}`}>
        <Gift className="w-3 h-3 mr-1" />
        Trial: {daysLeft} days left
      </Badge>
    );
  }

  if (planType === 'pro' || planType === 'pro_annual') {
    return (
      <Badge variant="secondary" className={`bg-purple-100 text-purple-800 ${className}`}>
        <Crown className="w-3 h-3 mr-1" />
        Family Pro
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      Free Plan
    </Badge>
  );
};

export default SubscriptionBadge;
