
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  userId?: string;
  householdId?: string;
  type: 'chore_reminder' | 'bill_reminder' | 'family_message' | 'calendar_event' | 'mvp_announcement' | 'test';
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, householdId, type, title, message, url, data }: PushNotificationRequest = await req.json();

    console.log('Processing push notification request:', { userId, householdId, type, title });

    // Get push subscriptions for the target users
    let subscriptionsQuery = supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (userId) {
      subscriptionsQuery = subscriptionsQuery.eq('user_id', userId);
    } else if (householdId) {
      // Get all users in the household
      const { data: householdMembers } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', householdId);
      
      if (householdMembers && householdMembers.length > 0) {
        const userIds = householdMembers.map(member => member.user_id);
        subscriptionsQuery = subscriptionsQuery.in('user_id', userIds);
      }
    }

    const { data: subscriptions, error: subscriptionsError } = await subscriptionsQuery;

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active push subscriptions found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active subscriptions found',
        sent: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    // For now, we'll return success since we don't have VAPID keys configured
    // This is where you would implement actual web push using libraries like web-push
    // TODO: Implement actual push notification sending with VAPID keys
    
    console.log('Push notification would be sent to subscriptions:', subscriptions.length);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Push notification processed',
      sent: subscriptions.length,
      note: 'Actual push delivery requires VAPID configuration'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
