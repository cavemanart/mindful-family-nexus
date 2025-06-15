
import { SUBSCRIPTION_PLANS, type PlanType, type FeatureName } from "./subscription-config";
import { supabase } from "@/integrations/supabase/client";
import { getUserPlan, getUserSubscription } from "./subscription-db";
import { isTrialActive, isUnlimited, isWithinLimit } from "./subscription-plan-helpers";

export function getFeatureLimits(planType: PlanType, isTrialActiveFlag: boolean = false) {
  const plan = SUBSCRIPTION_PLANS[planType];

  // During trial, free users get enhanced limits
  if (planType === 'free' && isTrialActiveFlag) {
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

  // Check current task count (using chores table for now)
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
