
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
