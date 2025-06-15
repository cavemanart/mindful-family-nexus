
import { supabase } from "@/integrations/supabase/client";
import type { PlanType } from "./subscription-config";

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Returns best/most relevant subscription record for user
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }

  if (!Array.isArray(data) || data.length === 0) return null;

  // Choose active paid plan first, then any active plan, then most recent record
  const best = data.find(row => (row.plan_type === 'pro_annual' || row.plan_type === 'pro') && row.is_active)
    || data.find(row => row.is_active)
    || data[0];

  return {
    ...best,
    plan_type: best.plan_type as PlanType
  };
}

export async function getUserPlan(userId: string): Promise<PlanType> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan_type || 'free';
}

export async function activateTrial(userId: string): Promise<boolean> {
  try {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString()
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error activating trial:', error);
    return false;
  }
}

// Initialize subscription for existing users who don't have one
export async function ensureUserSubscription(userId: string): Promise<UserSubscription> {
  let subscription = await getUserSubscription(userId);

  if (!subscription) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'free'
      })
      .select()
      .single();

    if (error) throw error;
    subscription = {
      ...data,
      plan_type: data.plan_type as PlanType
    };
  }

  return subscription;
}
