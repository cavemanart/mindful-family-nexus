
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

export interface ChoreSubmission {
  id: string;
  chore_id: string;
  child_id: string;
  household_id: string;
  submission_note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  points_awarded: number;
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
  const [choreSubmissions, setChoreSubmissions] = useState<ChoreSubmission[]>([]);
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

  const fetchChoreSubmissions = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('chore_submissions')
        .select('*')
        .eq('household_id', householdId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setChoreSubmissions(data || []);
    } catch (error: any) {
      console.error('Error fetching chore submissions:', error);
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

  const submitChoreForApproval = async (choreId: string, childId: string, submissionNote?: string) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('chore_submissions')
        .insert([{
          chore_id: choreId,
          child_id: childId,
          household_id: householdId,
          submission_note: submissionNote || null,
          status: 'pending'
        }]);

      if (error) throw error;

      // Update chore status
      await supabase
        .from('chores')
        .update({ 
          completed: true,
          approval_status: 'pending'
        })
        .eq('id', choreId);

      toast({
        title: "Success",
        description: "Chore submitted for approval!",
      });

      fetchChoreSubmissions();
      return true;
    } catch (error: any) {
      console.error('Error submitting chore:', error);
      toast({
        title: "Error",
        description: "Failed to submit chore for approval",
        variant: "destructive"
      });
      return false;
    }
  };

  const approveChoreSubmission = async (submissionId: string, pointsToAward: number) => {
    try {
      const submission = choreSubmissions.find(s => s.id === submissionId);
      if (!submission) return false;

      // Update submission status
      const { error: submissionError } = await supabase
        .from('chore_submissions')
        .update({
          status: 'approved',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
          points_awarded: pointsToAward
        })
        .eq('id', submissionId);

      if (submissionError) throw submissionError;

      // Update chore status
      await supabase
        .from('chores')
        .update({ 
          approval_status: 'approved',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', submission.chore_id);

      // Add points to child
      await addPointsToChild(submission.child_id, pointsToAward, 'chore_completion', `Completed chore`, submission.chore_id);

      toast({
        title: "Success",
        description: "Chore approved and points awarded!",
      });

      fetchChoreSubmissions();
      fetchChildPoints();
      return true;
    } catch (error: any) {
      console.error('Error approving chore:', error);
      toast({
        title: "Error",
        description: "Failed to approve chore",
        variant: "destructive"
      });
      return false;
    }
  };

  const addPointsToChild = async (childId: string, points: number, transactionType: string, description: string, relatedChoreId?: string) => {
    if (!householdId) return false;

    try {
      // Get or create child points record
      let { data: existingPoints, error: fetchError } = await supabase
        .from('child_points')
        .select('*')
        .eq('child_id', childId)
        .eq('household_id', householdId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingPoints) {
        // Create new points record
        const { error: insertError } = await supabase
          .from('child_points')
          .insert([{
            child_id: childId,
            household_id: householdId,
            total_points: points,
            level: Math.floor(points / 100) + 1,
            last_activity_date: new Date().toISOString().split('T')[0]
          }]);

        if (insertError) throw insertError;
      } else {
        // Update existing points
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
      }

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

      return true;
    } catch (error: any) {
      console.error('Error adding points:', error);
      return false;
    }
  };

  const getChildPoints = (childId: string): ChildPoints | null => {
    return childPoints.find(cp => cp.child_id === childId) || null;
  };

  const getPendingSubmissions = (): ChoreSubmission[] => {
    return choreSubmissions.filter(s => s.status === 'pending');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchChildPoints(),
        fetchChoreSubmissions(),
        fetchPointTransactions()
      ]);
      setLoading(false);
    };

    fetchData();
  }, [householdId]);

  return {
    childPoints,
    choreSubmissions,
    pointTransactions,
    loading,
    submitChoreForApproval,
    approveChoreSubmission,
    addPointsToChild,
    getChildPoints,
    getPendingSubmissions,
    refetch: () => {
      fetchChildPoints();
      fetchChoreSubmissions();
      fetchPointTransactions();
    }
  };
};
