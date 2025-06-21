
import { supabase } from "@/integrations/supabase/client";
import type { PlanType } from "./subscription-config";

export interface UserSubscription {
  id: string;
  user_id: string;
  household_id?: string;
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

// Get household subscription status instead of individual user subscription
export async function getHouseholdSubscription(householdId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .rpc('get_household_subscription_status', {
      p_household_id: householdId
    });

  if (error) {
    console.error('Error fetching household subscription:', error);
    return null;
  }

  const status = data?.[0];
  if (!status) return null;

  // Convert the function result to UserSubscription format
  return {
    id: '', // Not needed for household subscription checks
    user_id: status.owner_user_id || '',
    household_id: householdId,
    plan_type: status.plan_type as PlanType,
    trial_end_date: status.is_trial_active ? status.subscription_end_date : undefined,
    subscription_end_date: status.subscription_end_date,
    is_active: status.has_subscription,
    created_at: '',
    updated_at: '',
  };
}

// Returns best/most relevant subscription record for user (backward compatibility)
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

// Update to link subscription to household
export async function activateTrial(userId: string, householdId: string): Promise<boolean> {
  try {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        household_id: householdId
      })
      .eq('user_id', userId);

    return !error;
  } catch (error) {
    console.error('Error activating trial:', error);
    return false;
  }
}

// Initialize subscription for existing users who don't have one
export async function ensureUserSubscription(userId: string, householdId?: string): Promise<UserSubscription> {
  let subscription = await getUserSubscription(userId);

  if (!subscription) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'free',
        household_id: householdId
      })
      .select()
      .single();

    if (error) throw error;
    subscription = {
      ...data,
      plan_type: data.plan_type as PlanType
    };
  } else if (householdId && !subscription.household_id) {
    // Link existing subscription to household if not already linked
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ household_id: householdId })
      .eq('id', subscription.id)
      .select()
      .single();

    if (!error && data) {
      subscription = {
        ...data,
        plan_type: data.plan_type as PlanType
      };
    }
  }

  return subscription;
}
