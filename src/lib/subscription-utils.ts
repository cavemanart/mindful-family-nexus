
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_PLANS, type PlanType, type FeatureName, isUnlimited, isWithinLimit } from "./subscription-config";

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

// Simple utility functions - NO HOOKS
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }

  return {
    ...data,
    plan_type: data.plan_type as PlanType
  };
}

export async function getUserPlan(userId: string): Promise<PlanType> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan_type || 'free';
}

export function isTrialActive(subscription: UserSubscription | null): boolean {
  if (!subscription?.trial_end_date) return false;
  
  const trialEnd = new Date(subscription.trial_end_date);
  const now = new Date();
  
  return now < trialEnd;
}

export function checkFeatureAccess(planType: PlanType, feature: FeatureName, isTrialActive: boolean = false): boolean {
  const plan = SUBSCRIPTION_PLANS[planType];
  
  // During trial, free users get pro features
  if (planType === 'free' && isTrialActive) {
    return SUBSCRIPTION_PLANS.pro.features[feature];
  }
  
  return plan.features[feature];
}

export function getFeatureLimits(planType: PlanType, isTrialActive: boolean = false) {
  const plan = SUBSCRIPTION_PLANS[planType];
  
  // During trial, free users get enhanced limits
  if (planType === 'free' && isTrialActive) {
    const freePlan = SUBSCRIPTION_PLANS.free;
    return {
      ...plan,
      household_members: freePlan.trial_household_members,
      vent_tasks: SUBSCRIPTION_PLANS.pro.vent_tasks,
      recurring_vent_tasks: SUBSCRIPTION_PLANS.pro.recurring_vent_tasks,
      bills_per_month: SUBSCRIPTION_PLANS.pro.bills_per_month,
    };
  }
  
  return plan;
}

export async function canCreateHousehold(userId: string): Promise<boolean> {
  const planType = await getUserPlan(userId);
  const plan = SUBSCRIPTION_PLANS[planType];
  
  // Check current household count
  const { count } = await supabase
    .from('households')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);
  
  const currentCount = count || 0;
  const householdLimit = plan.households;
  return isWithinLimit(currentCount, householdLimit);
}

export async function canInviteHouseholdMember(userId: string, householdId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const planType = subscription?.plan_type || 'free';
  const trialActive = isTrialActive(subscription);
  const limits = getFeatureLimits(planType, trialActive);
  
  const memberLimit = limits.household_members;
  if (isUnlimited(memberLimit)) return true;
  
  // Check current member count for this household
  const { count } = await supabase
    .from('household_members')
    .select('id', { count: 'exact' })
    .eq('household_id', householdId);
  
  const currentCount = count || 0;
  return isWithinLimit(currentCount, memberLimit);
}

export async function canCreateBill(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const planType = subscription?.plan_type || 'free';
  const trialActive = isTrialActive(subscription);
  const limits = getFeatureLimits(planType, trialActive);
  
  const billLimit = limits.bills_per_month;
  if (isUnlimited(billLimit)) return true;
  
  // Check bills created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { count } = await supabase
    .from('bills')
    .select('id', { count: 'exact' })
    .gte('created_at', startOfMonth.toISOString())
    .in('household_id', 
      await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .then(res => res.data?.map(h => h.household_id) || [])
    );
  
  const currentCount = count || 0;
  return isWithinLimit(currentCount, billLimit);
}

export async function canCreateVentTask(userId: string, isRecurring: boolean = false): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const planType = subscription?.plan_type || 'free';
  const trialActive = isTrialActive(subscription);
  const limits = getFeatureLimits(planType, trialActive);
  
  const limit = isRecurring ? limits.recurring_vent_tasks : limits.vent_tasks;
  if (isUnlimited(limit)) return true;
  
  // Check current task count (using chores table for now, will rename later)
  const { count } = await supabase
    .from('chores')
    .select('id', { count: 'exact' })
    .in('household_id', 
      await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', userId)
        .then(res => res.data?.map(h => h.household_id) || [])
    );
  
  const currentCount = count || 0;
  return isWithinLimit(currentCount, limit);
}

// Initialize subscription for existing users who don't have one
export async function ensureUserSubscription(userId: string): Promise<UserSubscription> {
  let subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_type: 'free',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
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
