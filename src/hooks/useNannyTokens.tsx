
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNannyTokens = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateToken = async (householdId: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_nanny_token', {
        p_household_id: householdId
      });

      if (error) {
        toast({
          title: "Error generating token",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      toast({
        title: "Token generated successfully",
        description: "Share this code with your nanny for secure access",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_nanny_token', {
        p_token: token
      });

      if (error) {
        toast({
          title: "Invalid token",
          description: "Please check your token and try again",
          variant: "destructive"
        });
        return null;
      }

      if (!data) {
        toast({
          title: "Token expired or already used",
          description: "Please request a new token from the family",
          variant: "destructive"
        });
        return null;
      }

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateToken,
    verifyToken,
    loading
  };
};
