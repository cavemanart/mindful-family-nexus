
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FamilyMessage {
  id: string;
  message: string;
  from_member: string;
  to_member: string | null;
  is_special: boolean;
  created_at: string;
  household_id: string;
}

export const useFamilyMessages = (householdId: string | null) => {
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_messages')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (messageData: Omit<FamilyMessage, 'id' | 'created_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('family_messages')
        .insert([{ ...messageData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      
      fetchMessages();
      return true;
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [householdId]);

  return {
    messages,
    loading,
    addMessage,
    refetch: fetchMessages
  };
};
