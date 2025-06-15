
import { SUBSCRIPTION_PLANS, type FeatureName, type PlanType, type LimitValue } from "./subscription-config";

export function isUnlimited(limit: LimitValue): limit is -1 {
  return limit === -1;
}

export function isWithinLimit(currentCount: number, limit: LimitValue): boolean {
  return isUnlimited(limit) || currentCount < limit;
}

export function isTrialActive(subscription: { trial_end_date?: string } | null): boolean {
  if (!subscription?.trial_end_date) return false;
  const trialEnd = new Date(subscription.trial_end_date);
  const now = new Date();
  return now < trialEnd;
}
