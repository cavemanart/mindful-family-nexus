
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { isUnlimited } from '@/lib/subscription-config';

interface BillUsageIndicatorProps {
  currentCount: number;
  maxCount: number;
  planType: string;
  isTrialActive?: boolean;
}

const BillUsageIndicator: React.FC<BillUsageIndicatorProps> = ({
  currentCount,
  maxCount,
  planType,
  isTrialActive
}) => {
  // Don't show usage indicator for pro plans (unlimited)
  if (planType === 'pro' || planType === 'pro_annual') {
    return (
      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Pro Plan</span>
            </div>
            <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-600">
              Unlimited Bills
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show for unlimited limits (shouldn't happen for free plan, but safety check)
  if (isUnlimited(maxCount)) {
    return null;
  }

  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= maxCount;

  return (
    <Card className={`${isNearLimit ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20' : 'border-gray-200 dark:border-gray-700 bg-card dark:bg-card'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className={`h-4 w-4 ${isNearLimit ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Bills This Month</span>
              {isTrialActive && (
                <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 text-xs">
                  Trial Active
                </Badge>
              )}
            </div>
            <span className={`text-sm font-semibold ${
              isAtLimit ? 'text-red-600 dark:text-red-400' : 
              isNearLimit ? 'text-orange-600 dark:text-orange-400' : 
              'text-gray-700 dark:text-gray-300'
            }`}>
              {currentCount}/{maxCount}
            </span>
          </div>
          
          <Progress 
            value={Math.min(percentage, 100)} 
            className={`h-2 ${
              isAtLimit ? 'bg-red-100 dark:bg-red-900/20' : 
              isNearLimit ? 'bg-orange-100 dark:bg-orange-900/20' : 
              'bg-gray-100 dark:bg-gray-800'
            }`}
          />
          
          {isNearLimit && (
            <p className={`text-xs ${
              isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
            }`}>
              {isAtLimit 
                ? 'Bill limit reached. Upgrade to Pro for unlimited bills.'
                : `You're approaching your bill limit. ${maxCount - currentCount} bills remaining.`
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillUsageIndicator;
