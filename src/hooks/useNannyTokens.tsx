import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNannyTokens = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateToken = async (householdId: string): Promise<string | null> => {
    setLoading(true);
    try {
      // Generate a numeric-only token by calling the database function
      // and then converting any letters to numbers
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

      // Convert the alphanumeric token to numbers only
      let numericToken = '';
      for (let i = 0; i < data.length; i++) {
        const char = data[i];
        if (/[0-9]/.test(char)) {
          numericToken += char;
        } else {
          // Convert letters to numbers (A=1, B=2, etc.)
          const charCode = char.charCodeAt(0);
          if (charCode >= 65 && charCode <= 90) { // A-Z
            numericToken += ((charCode - 64) % 10).toString();
          } else if (charCode >= 97 && charCode <= 122) { // a-z
            numericToken += ((charCode - 96) % 10).toString();
          }
        }
      }

      // Ensure we have exactly 8 digits
      while (numericToken.length < 8) {
        numericToken += Math.floor(Math.random() * 10).toString();
      }
      numericToken = numericToken.substring(0, 8);

      toast({
        title: "Token generated successfully",
        description: "Share this numeric code with your nanny for secure access",
      });

      return numericToken;
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
