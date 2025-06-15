
import { SUBSCRIPTION_PLANS, type PlanType, type FeatureName } from "./subscription-config";

export function checkFeatureAccess(planType: PlanType, feature: FeatureName, isTrialActive: boolean = false): boolean {
  const plan = SUBSCRIPTION_PLANS[planType];

  // During trial, free users get pro features
  if (planType === 'free' && isTrialActive) {
    return SUBSCRIPTION_PLANS.pro.features[feature];
  }
  return plan.features[feature];
}
