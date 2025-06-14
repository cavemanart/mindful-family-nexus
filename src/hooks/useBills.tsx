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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  console.log('🧾 useBills hook initialized:', { householdId, userProfileId: userProfile?.id });

  const fetchBills = async () => {
    if (!householdId) {
      console.log('🧾 No household ID provided, skipping bills fetch');
      setLoading(false);
      setBills([]);
      return;
    }

    try {
      console.log('🧾 Fetching bills for household:', householdId);
      setError(null);
      setLoading(true);

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('household_id', householdId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('🧾 Error fetching bills:', error);
        throw error;
      }
      
      console.log('🧾 Bills fetched successfully:', data?.length || 0);
      
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
      console.error('🧾 Error in fetchBills:', error);
      const errorMessage = error.message || 'Failed to fetch bills';
      setError(errorMessage);
      toast({
        title: "Error fetching bills",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (billData: Omit<Bill, 'id' | 'created_at' | 'updated_at' | 'household_id'>) => {
    if (!householdId || !userProfile?.id) {
      console.error('🧾 Cannot add bill: missing household ID or user profile');
      return false;
    }

    try {
      console.log('🧾 Adding new bill:', billData.name);
      
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
        assigned_to: billData.assigned_to || '', // Handle empty assignment
        next_due_date: billData.recurrence_type !== 'none' ? calculateNextDueDate(billData.due_date, billData.recurrence_type, billData.recurrence_interval) : null
      };

      const { error } = await supabase
        .from('bills')
        .insert([newBill]);

      if (error) throw error;
      
      console.log('🧾 Bill added successfully');
      toast({
        title: "Success",
        description: "Bill added successfully!",
      });
      
      fetchBills();
      return true;
    } catch (error: any) {
      console.error('🧾 Error adding bill:', error);
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
    console.log('🧾 useBills effect triggered, householdId:', householdId);
    fetchBills();
  }, [householdId]);

  return {
    bills,
    loading,
    billsThisMonth,
    error,
    addBill,
    deleteBill,
    togglePaid,
    generateNextInstance,
    processRecurringBills,
    refetch: fetchBills
  };
};
