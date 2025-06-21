
import { SUBSCRIPTION_PLANS, type PlanType, type FeatureName } from "./subscription-config";
import { getHouseholdSubscription } from "./subscription-db";
import { isTrialActive } from "./subscription-plan-helpers";

export function checkFeatureAccess(planType: PlanType, feature: FeatureName, isTrialActive: boolean = false): boolean {
  const plan = SUBSCRIPTION_PLANS[planType];

  // During trial, free users get pro features
  if (planType === 'free' && isTrialActive) {
    return SUBSCRIPTION_PLANS.pro.features[feature];
  }
  return plan.features[feature];
}

// Check feature access based on household subscription
export async function checkHouseholdFeatureAccess(householdId: string, feature: FeatureName): Promise<boolean> {
  const subscription = await getHouseholdSubscription(householdId);
  const planType = subscription?.plan_type || 'free';
  const trialActive = subscription ? isTrialActive(subscription) : false;
  
  return checkFeatureAccess(planType, feature, trialActive);
}
