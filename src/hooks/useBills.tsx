
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
  recurrence_type?: 'none' | 'weekly' | 'monthly';
  recurrence_interval?: number;
  next_due_date?: string;
  is_template?: boolean;
  parent_bill_id?: string;
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
      const newBill = {
        ...billData,
        household_id: householdId,
        next_due_date: billData.recurrence_type !== 'none' ? calculateNextDueDate(billData.due_date, billData.recurrence_type, billData.recurrence_interval) : null
      };

      const { error } = await supabase
        .from('bills')
        .insert([newBill]);

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

  const generateNextInstance = async (billId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_next_bill_instance', {
        p_bill_id: billId
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Next bill instance generated!",
      });
      
      fetchBills();
      return true;
    } catch (error: any) {
      toast({
        title: "Error generating next bill",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const processRecurringBills = async () => {
    try {
      const { data, error } = await supabase.rpc('process_recurring_bills');

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Processed ${data || 0} recurring bills`,
      });
      
      fetchBills();
      return data || 0;
    } catch (error: any) {
      toast({
        title: "Error processing recurring bills",
        description: error.message,
        variant: "destructive"
      });
      return 0;
    }
  };

  const calculateNextDueDate = (dueDate: string, recurrenceType?: string, interval?: number): string => {
    if (!recurrenceType || recurrenceType === 'none' || !interval) return dueDate;

    const date = new Date(dueDate);
    
    if (recurrenceType === 'weekly') {
      date.setDate(date.getDate() + (7 * interval));
    } else if (recurrenceType === 'monthly') {
      date.setMonth(date.getMonth() + interval);
    }
    
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchBills();
  }, [householdId]);

  return {
    bills,
    loading,
    addBill,
    togglePaid,
    generateNextInstance,
    processRecurringBills,
    refetch: fetchBills
  };
};
