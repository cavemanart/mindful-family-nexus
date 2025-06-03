import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { canCreateBill } from '@/lib/subscription-utils';

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
  const [billsThisMonth, setBillsThisMonth] = useState(0);
  const { toast } = useToast();
  const { userProfile } = useAuth();

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
      
      // Transform the data to ensure proper typing
      const typedBills: Bill[] = (data || []).map(bill => ({
        ...bill,
        recurrence_type: bill.recurrence_type as 'none' | 'weekly' | 'monthly' || 'none',
        recurrence_interval: bill.recurrence_interval || 1,
        next_due_date: bill.next_due_date || undefined,
        is_template: bill.is_template || false,
        parent_bill_id: bill.parent_bill_id || undefined
      }));
      
      setBills(typedBills);

      // Count bills created this month for limit tracking
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const billsThisMonthCount = typedBills.filter(bill => 
        new Date(bill.created_at) >= startOfMonth
      ).length;
      
      setBillsThisMonth(billsThisMonthCount);
      
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
    if (!householdId || !userProfile?.id) return false;

    try {
      // Check subscription limits before creating
      const canCreate = await canCreateBill(userProfile.id);
      if (!canCreate) {
        toast({
          title: "Bill limit reached",
          description: "You've reached the maximum number of bills for your plan. Upgrade to Pro for unlimited bills.",
          variant: "destructive"
        });
        return false;
      }

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

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Bill deleted successfully!",
      });
      
      fetchBills();
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting bill",
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
    billsThisMonth,
    addBill,
    deleteBill,
    togglePaid,
    generateNextInstance,
    processRecurringBills,
    refetch: fetchBills
  };
};
