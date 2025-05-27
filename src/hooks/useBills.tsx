
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  household_id: string;
}

export const useBills = (householdId: string | null) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBills = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('household_id', householdId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching bills",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('bills')
        .insert([{ ...billData, household_id: householdId }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Bill added successfully!",
      });
      
      fetchBills();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding bill",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const togglePaid = async (id: string) => {
    try {
      const bill = bills.find(b => b.id === id);
      if (!bill) return false;

      const { error } = await supabase
        .from('bills')
        .update({ 
          is_paid: !bill.is_paid,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchBills();
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating bill",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBills();
  }, [householdId]);

  return {
    bills,
    loading,
    addBill,
    togglePaid,
    refetch: fetchBills
  };
};
