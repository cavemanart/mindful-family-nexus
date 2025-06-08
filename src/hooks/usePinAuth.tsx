
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChildData {
  child_id: string;
  child_name: string;
  avatar_selection: string;
  household_id: string;
}

export const usePinAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const verifyPin = async (pin: string, householdId: string): Promise<ChildData> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('verify_child_pin', {
        p_pin: pin,
        p_household_id: householdId
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Invalid PIN. Please try again.');
      }

      const childData = data[0];
      
      toast({
        title: `Welcome ${childData.child_name}! 🎉`,
        description: "Let's see what you can do today!",
      });

      return childData;
    } catch (error: any) {
      console.error('PIN verification error:', error);
      toast({
        title: "Oops! 😅",
        description: error.message || "That PIN doesn't seem right. Try again!",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    verifyPin,
    loading
  };
};
