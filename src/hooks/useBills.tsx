
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { pushNotificationService } from '@/lib/push-notifications';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  assigned_to: string;
  household_id: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  recurrence_type?: string;
  recurrence_interval?: number;
  next_due_date?: string;
  is_template?: boolean;
  parent_bill_id?: string;
}

export const useBills = (householdId: string | null) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    if (!householdId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .eq('household_id', householdId)
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      setBills(data || []);
    } catch (err: any) {
      console.error('Error fetching bills:', err);
      setError(err.message);
      toast.error('Failed to load bills');
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

      toast.success('Bill created successfully');
      
      // Send push notification for new bill
      try {
        const dueDate = new Date(billData.due_date).toLocaleDateString();
        await pushNotificationService.sendBillReminder(
          billData.name,
          dueDate
        );
      } catch (notifError) {
        console.warn('Failed to send bill notification:', notifError);
      }
      
      await fetchBills();
      return true;
    } catch (err: any) {
      console.error('Error creating bill:', err);
      toast.error('Failed to create bill');
      return false;
    }
  };

  const togglePaid = async (id: string) => {
    try {
      const bill = bills.find(b => b.id === id);
      if (!bill) return false;

      const { error } = await supabase
        .from('bills')
        .update({ is_paid: !bill.is_paid })
        .eq('id', id);

      if (error) throw error;

      toast.success(!bill.is_paid ? 'Bill marked as paid' : 'Bill marked as unpaid');
      
      // Send notification if bill is marked as paid
      if (!bill.is_paid) {
        try {
          await pushNotificationService.sendBillReminder(
            `${bill.name} has been paid! ✅`,
            'Today'
          );
        } catch (notifError) {
          console.warn('Failed to send payment notification:', notifError);
        }
      }
      
      await fetchBills();
      return true;
    } catch (err: any) {
      console.error('Error updating bill:', err);
      toast.error('Failed to update bill');
      return false;
    }
  };

  const generateNextInstance = async (billId: string) => {
    try {
      const { data, error } = await supabase.rpc('generate_next_bill_instance', {
        p_bill_id: billId
      });

      if (error) throw error;

      toast.success('Next bill instance generated');
      await fetchBills();
      return true;
    } catch (err: any) {
      console.error('Error generating next bill:', err);
      toast.error('Failed to generate next bill');
      return false;
    }
  };

  const processRecurringBills = async () => {
    try {
      const { data, error } = await supabase.rpc('process_recurring_bills');

      if (error) throw error;

      toast.success(`Generated ${data || 0} recurring bills`);
      await fetchBills();
      return true;
    } catch (err: any) {
      console.error('Error processing recurring bills:', err);
      toast.error('Failed to process recurring bills');
      return false;
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Bill deleted successfully');
      await fetchBills();
      return true;
    } catch (err: any) {
      console.error('Error deleting bill:', err);
      toast.error('Failed to delete bill');
      return false;
    }
  };

  // Calculate bills this month for subscription limits
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const billsThisMonth = bills.filter(bill => {
    const billDate = new Date(bill.created_at);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  }).length;

  useEffect(() => {
    fetchBills();
  }, [householdId]);

  return {
    bills,
    loading,
    error,
    billsThisMonth,
    addBill,
    togglePaid,
    generateNextInstance,
    processRecurringBills,
    deleteBill,
    refetch: fetchBills,
  };
};
