
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyContact {
  id: string;
  household_id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
}

export const useEmergencyContacts = (householdId?: string) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('household_id', householdId)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) {
        toast({
          title: "Error fetching emergency contacts",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setContacts(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contact: Omit<EmergencyContact, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([contact])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding contact",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      fetchContacts();
      toast({
        title: "Success",
        description: "Emergency contact added successfully"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const updateContact = async (contactId: string, updates: Partial<EmergencyContact>) => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating contact",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      fetchContacts();
      toast({
        title: "Success",
        description: "Emergency contact updated successfully"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        toast({
          title: "Error deleting contact",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      fetchContacts();
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [householdId]);

  return {
    contacts,
    loading,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact
  };
};
