
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook verified", { type: event.type });

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabaseClient, event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(supabaseClient, event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(supabaseClient, event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.paused':
        await handleSubscriptionPaused(supabaseClient, event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(supabaseClient, event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_action_required':
        await handlePaymentActionRequired(supabaseClient, event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(supabaseClient, event.data.object as Stripe.Subscription);
        break;
      
      case 'charge.dispute.created':
        await handleChargeDispute(supabaseClient, event.data.object as Stripe.Dispute);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription update", { subscriptionId: subscription.id });
  
  const customerId = subscription.customer as string;
  const amount = subscription.items.data[0].price.unit_amount || 0;
  const interval = subscription.items.data[0].price.recurring?.interval;
  
  // Determine plan type from amount and interval
  let planType = 'free';
  if (interval === 'year' && amount === 4999) {
    planType = 'pro_annual';
  } else if (interval === 'month' && amount === 499) {
    planType = 'pro';
  }
  
  const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const subscriptionStart = new Date(subscription.start_date * 1000).toISOString();
  
  // Find user by Stripe customer ID
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single();
  
  if (existingSubscription) {
    // Update existing subscription
    await supabase
      .from('user_subscriptions')
      .update({
        plan_type: planType,
        stripe_subscription_id: subscription.id,
        is_active: subscription.status === 'active',
        status: subscription.status,
        subscription_start_date: subscriptionStart,
        subscription_end_date: subscriptionEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }
  
  logStep("Subscription updated successfully");
}

async function handleSubscriptionCancellation(supabase: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription cancellation", { subscriptionId: subscription.id });
  
  await supabase
    .from('user_subscriptions')
    .update({
      is_active: false,
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
  
  logStep("Subscription cancelled successfully");
}

async function handlePaymentSuccess(supabase: any, invoice: Stripe.Invoice) {
  logStep("Handling payment success", { invoiceId: invoice.id });
  
  if (invoice.subscription) {
    await supabase
      .from('user_subscriptions')
      .update({
        is_active: true,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);
  }
  
  logStep("Payment success handled");
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  logStep("Handling payment failure", { invoiceId: invoice.id });
  
  if (invoice.subscription) {
    await supabase
      .from('user_subscriptions')
      .update({
        is_active: false,
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);
  }
  
  logStep("Payment failure handled");
}

async function handleSubscriptionPaused(supabase: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription paused", { subscriptionId: subscription.id });
  
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'paused',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
  
  logStep("Subscription paused handled");
}

async function handleSubscriptionResumed(supabase: any, subscription: Stripe.Subscription) {
  logStep("Handling subscription resumed", { subscriptionId: subscription.id });
  
  await supabase
    .from('user_subscriptions')
    .update({
      is_active: true,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
  
  logStep("Subscription resumed handled");
}

async function handlePaymentActionRequired(supabase: any, invoice: Stripe.Invoice) {
  logStep("Handling payment action required", { invoiceId: invoice.id });
  
  if (invoice.subscription) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'incomplete',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);
  }
  
  logStep("Payment action required handled");
}

async function handleTrialWillEnd(supabase: any, subscription: Stripe.Subscription) {
  logStep("Handling trial will end", { subscriptionId: subscription.id });
  
  // You can add logic here to send notifications to users
  // For now, just log the event
  logStep("Trial ending soon for subscription", { subscriptionId: subscription.id });
}

async function handleChargeDispute(supabase: any, dispute: Stripe.Dispute) {
  logStep("Handling charge dispute", { disputeId: dispute.id });
  
  // You can add logic here to handle disputes
  // For now, just log the event
  logStep("Charge dispute created", { disputeId: dispute.id, amount: dispute.amount });
}
