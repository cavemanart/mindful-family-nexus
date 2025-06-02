
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Success: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (userProfile?.id) {
      checkSubscriptionStatus();
    }
  }, [userProfile?.id]);

  const checkSubscriptionStatus = async () => {
    try {
      console.log('🔄 Checking subscription status after successful payment...');
      const { data, error } = await supabase.functions.invoke('check-subscription-status');
      
      if (error) {
        console.error('❌ Error checking subscription:', error);
      } else {
        console.log('✅ Subscription status updated:', data);
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('🚨 Error in subscription check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to continue</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Processing Your Payment</h2>
            <p className="text-gray-600">Please wait while we update your subscription...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <Card className="w-full max-w-md border-green-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div>
            <p className="text-gray-700 mb-2">
              Thank you for upgrading to Pro! Your subscription is now active.
            </p>
            {sessionId && (
              <p className="text-sm text-gray-500">
                Transaction ID: {sessionId.slice(-8)}...
              </p>
            )}
          </div>

          {subscriptionStatus && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Your New Plan</h3>
              <p className="text-green-700 capitalize">
                {subscriptionStatus.plan_type?.replace('_', ' ') || 'Pro'} Plan
              </p>
              {subscriptionStatus.subscription_end_date && (
                <p className="text-sm text-green-600 mt-1">
                  Active until {new Date(subscriptionStatus.subscription_end_date).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">You now have access to:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Unlimited bills and tasks</li>
              <li>✅ Unlimited household members</li>
              <li>✅ Advanced calendar features</li>
              <li>✅ Mini-Coach Moments</li>
              <li>✅ Priority support</li>
            </ul>
          </div>

          <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-700">
            Continue to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-xs text-gray-500">
            Questions? Contact our support team for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
