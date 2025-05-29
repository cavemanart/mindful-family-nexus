
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    households: 1,
    bills_per_month: 5,
    vent_tasks: 5,
    recurring_vent_tasks: 3,
    household_members: 1, // Just the owner
    trial_household_members: 3, // Owner + 2 during trial
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
    households: 1,
    bills_per_month: -1, // unlimited
    vent_tasks: -1, // unlimited
    recurring_vent_tasks: -1, // unlimited
    household_members: -1, // unlimited
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
    households: 1,
    bills_per_month: -1, // unlimited
    vent_tasks: -1, // unlimited
    recurring_vent_tasks: -1, // unlimited
    household_members: -1, // unlimited
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
