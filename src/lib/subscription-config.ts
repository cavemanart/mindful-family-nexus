
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    households: 1 as const,
    bills_per_month: 5 as const,
    vent_tasks: 5 as const,
    recurring_vent_tasks: 3 as const,
    household_members: 1 as const, // Just the owner
    trial_household_members: 3 as const, // Owner + 2 during trial
    features: {
      thanks_dashboard: true,
      family_notes: true,
      simplified_calendar: true,
      advanced_calendar: false,
      unlimited_bills: false,
      unlimited_tasks: false,
      priority_support: false,
      mini_coach: false,
    }
  },
  pro: {
    name: 'Family Pro',
    price: 799, // $7.99 in cents
    households: 1 as const,
    bills_per_month: -1 as const, // unlimited
    vent_tasks: -1 as const, // unlimited
    recurring_vent_tasks: -1 as const, // unlimited
    household_members: -1 as const, // unlimited
    features: {
      thanks_dashboard: true,
      family_notes: true,
      simplified_calendar: true,
      advanced_calendar: true,
      unlimited_bills: true,
      unlimited_tasks: true,
      priority_support: true,
      mini_coach: true,
    }
  },
  pro_annual: {
    name: 'Family Pro Annual',
    price: 6999, // $69.99 in cents (about $5.83/month)
    households: 1 as const,
    bills_per_month: -1 as const, // unlimited
    vent_tasks: -1 as const, // unlimited
    recurring_vent_tasks: -1 as const, // unlimited
    household_members: -1 as const, // unlimited
    features: {
      thanks_dashboard: true,
      family_notes: true,
      simplified_calendar: true,
      advanced_calendar: true,
      unlimited_bills: true,
      unlimited_tasks: true,
      priority_support: true,
      mini_coach: true,
    }
  }
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;
export type FeatureName = keyof typeof SUBSCRIPTION_PLANS.free.features;

// Helper type for limits that can be unlimited (-1)
export type LimitValue = number;

// Helper function to check if a limit is unlimited
export function isUnlimited(limit: LimitValue): limit is -1 {
  return limit === -1;
}

// Helper function to check if current usage is within limit
export function isWithinLimit(currentCount: number, limit: LimitValue): boolean {
  return isUnlimited(limit) || currentCount < limit;
}
