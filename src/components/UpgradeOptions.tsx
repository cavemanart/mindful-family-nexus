
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-config";

interface UpgradeOptionsProps {
  proPrice: string;
  proAnnualPrice: string;
  proAnnualSavings: string;
  checkoutLoading: string | null;
  onUpgrade: (planType: 'pro' | 'pro_annual') => void;
}

const UpgradeOptions: React.FC<UpgradeOptionsProps> = ({
  proPrice,
  proAnnualPrice,
  proAnnualSavings,
  checkoutLoading,
  onUpgrade,
}) => (
  <div className="grid md:grid-cols-2 gap-6">
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Family Pro</span>
          <Badge variant="secondary">Most Popular</Badge>
        </CardTitle>
        <p className="text-2xl font-bold">${proPrice}<span className="text-sm font-normal">/month</span></p>
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
          onClick={() => onUpgrade('pro')}
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
        <p className="text-2xl font-bold">${proAnnualPrice}<span className="text-sm font-normal">/year</span></p>
        <p className="text-sm text-green-600">Save ${proAnnualSavings}/year!</p>
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
          onClick={() => onUpgrade('pro_annual')}
          disabled={checkoutLoading === 'pro_annual'}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {checkoutLoading === 'pro_annual' ? 'Processing...' : 'Upgrade to Annual'}
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default UpgradeOptions;
