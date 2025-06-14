
import { supabase } from '@/integrations/supabase/client';

export const ensureUserSubscription = async (userId: string) => {
  try {
    console.log('🔍 Checking subscription for user:', userId);
    
    // Check if subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('id, plan_type')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking subscription:', checkError);
      return; // Don't throw - this is non-critical
    }

    if (existingSubscription) {
      console.log('✅ User already has subscription:', existingSubscription.plan_type);
      return;
    }

    // Create free subscription if none exists
    console.log('📝 Creating free subscription for user');
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert([{
        user_id: userId,
        plan_type: 'free',
        is_active: true
      }]);

    if (insertError) {
      console.error('❌ Error creating subscription:', insertError);
      return; // Don't throw - this is non-critical
    }

    console.log('✅ Free subscription created successfully');
  } catch (error) {
    console.error('🚨 Unexpected error in ensureUserSubscription:', error);
    // Don't throw - subscription issues shouldn't block authentication
  }
};

export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
};

export const isTrialActive = (subscription: any) => {
  if (!subscription || !subscription.trial_end_date) return false;
  
  const now = new Date();
  const trialEnd = new Date(subscription.trial_end_date);
  return now < trialEnd;
};

export const checkFeatureAccess = (planType: string, feature: string, isTrialActive: boolean = false) => {
  // If trial is active, user has access to all pro features
  if (isTrialActive) return true;
  
  // Pro and pro_annual have access to all features
  if (planType === 'pro' || planType === 'pro_annual') return true;
  
  // Free plan feature access
  const freeFeatures = ['basic_calendar', 'basic_bills', 'basic_notes'];
  
  if (planType === 'free') {
    return freeFeatures.includes(feature);
  }
  
  return false;
};

export const getFeatureLimits = (planType: string, isTrialActive: boolean = false) => {
  // If trial is active, use pro limits
  if (isTrialActive) {
    return {
      bills_per_month: -1, // unlimited
      events_per_month: -1, // unlimited
      household_members: -1, // unlimited
    };
  }
  
  if (planType === 'pro' || planType === 'pro_annual') {
    return {
      bills_per_month: -1, // unlimited
      events_per_month: -1, // unlimited
      household_members: -1, // unlimited
    };
  }
  
  // Free plan limits
  return {
    bills_per_month: 10,
    events_per_month: 20,
    household_members: 6,
  };
};

export const canCreateBill = async (userId: string) => {
  try {
    const subscription = await getUserSubscription(userId);
    const planType = subscription?.plan_type || 'free';
    const trialActive = subscription ? isTrialActive(subscription) : false;
    const limits = getFeatureLimits(planType, trialActive);
    
    // If unlimited bills, always return true
    if (limits.bills_per_month === -1) return true;
    
    // Check current month's bill count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('bills')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());
    
    if (error) {
      console.error('Error checking bill count:', error);
      return true; // Allow creation if we can't check
    }
    
    return (count || 0) < limits.bills_per_month;
  } catch (error) {
    console.error('Error in canCreateBill:', error);
    return true; // Allow creation if error occurs
  }
};
