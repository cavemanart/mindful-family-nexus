import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Get or upsert subscription record
    let { data: subscription } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subscription) {
      logStep("Creating initial subscription record (upsert, not insert) for user_id", { userId: user.id });
      // Use upsert to avoid duplicates and ensure uniqueness
      const upsertResult = await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: "free",
          is_active: true,
        }, { onConflict: "user_id" })
        .select()
        .maybeSingle();
      if (upsertResult.error) throw upsertResult.error;
      subscription = upsertResult.data;
    }

    // Check Stripe if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({
        plan_type: subscription.plan_type,
        is_trial_active: subscription.trial_end_date ? new Date(subscription.trial_end_date) > new Date() : false,
        trial_end_date: subscription.trial_end_date
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let planType = subscription.plan_type;
    let isActive = subscription.is_active;
    let subscriptionEnd = subscription.subscription_end_date;

    if (subscriptions.data.length > 0) {
      const activeSub = subscriptions.data[0];
      const amount = activeSub.items.data[0].price.unit_amount || 0;
      const interval = activeSub.items.data[0].price.recurring?.interval;

      // Determine plan type from amount and interval
      if (interval === 'year' && amount === 6999) {
        planType = 'pro_annual';
      } else if (interval === 'month' && amount === 799) {
        planType = 'pro';
      }

      isActive = true;
      subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();

      logStep("Active subscription found", { planType, subscriptionEnd });

      // Update database (upsert again just in case)
      await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: planType,
          stripe_customer_id: customerId,
          stripe_subscription_id: activeSub.id,
          is_active: true,
          subscription_start_date: new Date(activeSub.start_date * 1000).toISOString(),
          subscription_end_date: subscriptionEnd
        }, { onConflict: "user_id" });
    } else {
      logStep("No active subscription found, updating to keep current plan");
      // Update customer ID but keep current plan
      await supabaseClient
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          plan_type: subscription.plan_type,
          stripe_customer_id: customerId,
          stripe_subscription_id: null,
          subscription_start_date: null,
          subscription_end_date: null,
          is_active: subscription.is_active,
        }, { onConflict: "user_id" });
    }

    return new Response(JSON.stringify({
      plan_type: planType,
      is_active: isActive,
      is_trial_active: subscription.trial_end_date ? new Date(subscription.trial_end_date) > new Date() : false,
      trial_end_date: subscription.trial_end_date,
      subscription_end_date: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
