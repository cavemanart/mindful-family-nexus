
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrialActivationProps {
  userId: string;
  onTrialStarted: () => void;
}

const TrialActivation: React.FC<TrialActivationProps> = ({ userId, onTrialStarted }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const startTrial = async () => {
    setLoading(true);
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEndDate.toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Trial Started!',
        description: 'You now have 14 days of Pro features. Enjoy!',
      });

      onTrialStarted();
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: 'Error',
        description: 'Failed to start trial. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Gift className="h-5 w-5" />
          Start Your Free Trial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-green-700">
          Try all Pro features free for 14 days. No credit card required!
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Unlimited bills and tasks
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Unlimited household members
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Advanced calendar features
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Mini-Coach Moments
          </div>
        </div>

        <Button 
          onClick={startTrial} 
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Starting Trial...' : 'Start 14-Day Free Trial'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrialActivation;
