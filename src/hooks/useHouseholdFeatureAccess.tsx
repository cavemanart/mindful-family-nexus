
import { useHouseholdSubscription } from './useHouseholdSubscription';
import { checkFeatureAccess } from '@/lib/feature-access';
import type { FeatureName } from '@/lib/subscription-config';

export const useHouseholdFeatureAccess = () => {
  const { subscriptionStatus, loading, hasProAccess } = useHouseholdSubscription();
  
  const checkFeature = (featureName: FeatureName): boolean => {
    if (loading) return false;
    
    return checkFeatureAccess(
      subscriptionStatus.planType as any, 
      featureName, 
      subscriptionStatus.isTrialActive
    );
  };

  return {
    hasProAccess,
    checkFeature,
    loading,
    subscriptionStatus,
    // Convenience properties for common features
    hasAdvancedCalendar: checkFeature('advanced_calendar'),
    hasUnlimitedBills: checkFeature('unlimited_bills'),
    hasUnlimitedTasks: checkFeature('unlimited_tasks'),
    hasMiniCoach: checkFeature('mini_coach'),
    hasPrioritySupport: checkFeature('priority_support'),
  };
};
