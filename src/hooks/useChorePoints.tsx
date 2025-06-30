
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChildPoints {
  id: string;
  child_id: string;
  household_id: string;
  total_points: number;
  level: number;
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PointTransaction {
  id: string;
  child_id: string;
  household_id: string;
  transaction_type: string;
  points_change: number;
  description: string;
  related_chore_id: string | null;
  related_reward_id: string | null;
  created_by: string | null;
  created_at: string;
}

export const useChorePoints = (householdId: string | null) => {
  const [childPoints, setChildPoints] = useState<ChildPoints[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChildPoints = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('child_points')
        .select('*')
        .eq('household_id', householdId)
        .order('total_points', { ascending: false });

      if (error) throw error;
      setChildPoints(data || []);
    } catch (error: any) {
      console.error('Error fetching child points:', error);
      toast({
        title: "Error",
        description: "Failed to fetch child points",
        variant: "destructive"
      });
    }
  };

  const initializeChildPoints = async (childId: string) => {
    if (!householdId) return false;

    try {
      // Check if child points record already exists
      const { data: existingPoints } = await supabase
        .from('child_points')
        .select('id')
        .eq('child_id', childId)
        .eq('household_id', householdId)
        .single();

      if (existingPoints) return true; // Already exists

      // Create new child points record
      const { error } = await supabase
        .from('child_points')
        .insert([{
          child_id: childId,
          household_id: householdId,
          total_points: 0,
          level: 1,
          streak_days: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;
      
      await fetchChildPoints(); // Refresh the data
      return true;
    } catch (error: any) {
      console.error('Error initializing child points:', error);
      return false;
    }
  };

  const fetchPointTransactions = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPointTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching point transactions:', error);
    }
  };

  const addPointsToChild = async (childId: string, points: number, transactionType: string, description: string, relatedChoreId?: string) => {
    if (!householdId) return false;

    try {
      // Initialize child points if they don't exist
      await initializeChildPoints(childId);

      // Get current child points
      const { data: existingPoints, error: fetchError } = await supabase
        .from('child_points')
        .select('*')
        .eq('child_id', childId)
        .eq('household_id', householdId)
        .single();

      if (fetchError) throw fetchError;

      // Update points
      const newTotal = existingPoints.total_points + points;
      const { error: updateError } = await supabase
        .from('child_points')
        .update({
          total_points: newTotal,
          level: Math.floor(newTotal / 100) + 1,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', existingPoints.id);

      if (updateError) throw updateError;

      // Log transaction
      await supabase
        .from('point_transactions')
        .insert([{
          child_id: childId,
          household_id: householdId,
          transaction_type: transactionType,
          points_change: points,
          description: description,
          related_chore_id: relatedChoreId || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      fetchChildPoints(); // Refresh points
      fetchPointTransactions(); // Refresh transactions
      return true;
    } catch (error: any) {
      console.error('Error adding points:', error);
      toast({
        title: "Error",
        description: "Failed to add points",
        variant: "destructive"
      });
      return false;
    }
  };

  const getChildPoints = (childId: string): ChildPoints | null => {
    return childPoints.find(cp => cp.child_id === childId) || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchChildPoints(),
        fetchPointTransactions()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [householdId]);

  return {
    childPoints,
    pointTransactions,
    loading,
    addPointsToChild,
    initializeChildPoints,
    getChildPoints,
    refetch: () => {
      fetchChildPoints();
      fetchPointTransactions();
    }
  };
};
