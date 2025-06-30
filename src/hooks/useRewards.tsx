import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reward {
  id: string;
  household_id: string;
  name: string;
  description: string | null;
  point_cost: number;
  category: string;
  is_active: boolean;
  age_restriction: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  child_id: string;
  household_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  redeemed_at: string;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
}

export const useRewards = (householdId: string | null) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRewards = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('rewards_catalog')
        .select('*')
        .eq('household_id', householdId)
        .eq('is_active', true)
        .order('point_cost', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error: any) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rewards",
        variant: "destructive"
      });
    }
  };

  const fetchRedemptions = async () => {
    if (!householdId) return;

    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('household_id', householdId)
        .order('redeemed_at', { ascending: false });

      if (error) throw error;
      setRedemptions((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'fulfilled' | 'cancelled'
      })));
    } catch (error: any) {
      console.error('Error fetching redemptions:', error);
    }
  };

  const createReward = async (rewardData: Omit<Reward, 'id' | 'household_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('rewards_catalog')
        .insert([{
          ...rewardData,
          household_id: householdId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reward created successfully!",
      });

      fetchRewards();
      return true;
    } catch (error: any) {
      console.error('Error creating reward:', error);
      toast({
        title: "Error",
        description: "Failed to create reward",
        variant: "destructive"
      });
      return false;
    }
  };

  const redeemReward = async (rewardId: string, childId: string, pointsToSpend: number) => {
    if (!householdId) return false;

    try {
      const { error } = await supabase
        .from('reward_redemptions')
        .insert([{
          child_id: childId,
          household_id: householdId,
          reward_id: rewardId,
          points_spent: pointsToSpend,
          status: 'pending'
        }]);

      if (error) throw error;

      // Deduct points from child
      const { data: childPoints, error: fetchError } = await supabase
        .from('child_points')
        .select('*')
        .eq('child_id', childId)
        .eq('household_id', householdId)
        .single();

      if (fetchError) throw fetchError;

      if (childPoints && childPoints.total_points >= pointsToSpend) {
        const newTotal = childPoints.total_points - pointsToSpend;
        await supabase
          .from('child_points')
          .update({
            total_points: newTotal,
            level: Math.floor(newTotal / 100) + 1
          })
          .eq('id', childPoints.id);

        // Log transaction
        await supabase
          .from('point_transactions')
          .insert([{
            child_id: childId,
            household_id: householdId,
            transaction_type: 'reward_redemption',
            points_change: -pointsToSpend,
            description: 'Redeemed reward',
            related_reward_id: rewardId,
            created_by: childId
          }]);

        toast({
          title: "Success",
          description: "Reward redeemed successfully!",
        });

        fetchRedemptions();
        return true;
      } else {
        throw new Error('Insufficient points');
      }
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Error",
        description: error.message === 'Insufficient points' ? "Not enough points!" : "Failed to redeem reward",
        variant: "destructive"
      });
      return false;
    }
  };

  const fulfillRedemption = async (redemptionId: string) => {
    try {
      const { error } = await supabase
        .from('reward_redemptions')
        .update({
          status: 'fulfilled',
          fulfilled_by: (await supabase.auth.getUser()).data.user?.id,
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', redemptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reward marked as fulfilled!",
      });

      fetchRedemptions();
      return true;
    } catch (error: any) {
      console.error('Error fulfilling redemption:', error);
      toast({
        title: "Error",
        description: "Failed to fulfill redemption",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateReward = async (rewardId: string, rewardData: Partial<Omit<Reward, 'id' | 'household_id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    try {
      const { error } = await supabase
        .from('rewards_catalog')
        .update({
          ...rewardData,
          updated_at: new Date().toISOString()
        })
        .eq('id', rewardId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reward updated successfully!",
      });

      fetchRewards();
      return true;
    } catch (error: any) {
      console.error('Error updating reward:', error);
      toast({
        title: "Error",
        description: "Failed to update reward",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('rewards_catalog')
        .update({ is_active: false })
        .eq('id', rewardId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reward deleted successfully!",
      });

      fetchRewards();
      return true;
    } catch (error: any) {
      console.error('Error deleting reward:', error);
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRewards(), fetchRedemptions()]);
      setLoading(false);
    };

    fetchData();
  }, [householdId]);

  return {
    rewards,
    redemptions,
    loading,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
    fulfillRedemption,
    refetch: () => {
      fetchRewards();
      fetchRedemptions();
    }
  };
};
