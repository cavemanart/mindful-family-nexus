
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Crown, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = currentCount >= maxCount;

  if (planType === 'pro' || planType === 'pro_annual') {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Pro Plan</span>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-300">
              Unlimited Bills
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isNearLimit ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className={`h-4 w-4 ${isNearLimit ? 'text-orange-600' : 'text-gray-600'}`} />
              <span className="text-sm font-medium">Bills This Month</span>
              {isTrialActive && (
                <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                  Trial Active
                </Badge>
              )}
            </div>
            <span className={`text-sm font-semibold ${
              isAtLimit ? 'text-red-600' : 
              isNearLimit ? 'text-orange-600' : 
              'text-gray-700'
            }`}>
              {currentCount}/{maxCount}
            </span>
          </div>
          
          <Progress 
            value={Math.min(percentage, 100)} 
            className={`h-2 ${
              isAtLimit ? 'bg-red-100' : 
              isNearLimit ? 'bg-orange-100' : 
              'bg-gray-100'
            }`}
          />
          
          {isNearLimit && (
            <p className={`text-xs ${
              isAtLimit ? 'text-red-600' : 'text-orange-600'
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
