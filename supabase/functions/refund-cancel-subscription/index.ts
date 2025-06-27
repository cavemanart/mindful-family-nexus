
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REFUND-CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Parse request body
    const { subscriptionId, userId } = await req.json();
    if (!subscriptionId) {
      throw new Error("subscriptionId is required");
    }

    logStep("Processing refund and cancellation", { subscriptionId, userId });

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    logStep("Retrieved subscription", { 
      subscriptionId: subscription.id,
      status: subscription.status,
      customerId: subscription.customer
    });

    // Get the latest invoice for this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      status: 'paid',
      limit: 1,
    });

    let refundId = null;
    if (invoices.data.length > 0) {
      const latestInvoice = invoices.data[0];
      logStep("Found latest paid invoice", { invoiceId: latestInvoice.id });

      if (latestInvoice.charge) {
        // Create refund for the latest payment
        const refund = await stripe.refunds.create({
          charge: latestInvoice.charge as string,
          reason: 'requested_by_customer',
        });
        refundId = refund.id;
        logStep("Created refund", { refundId, amount: refund.amount });
      }
    }

    // Cancel the subscription
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    logStep("Canceled subscription", { 
      subscriptionId: canceledSubscription.id,
      status: canceledSubscription.status
    });

    // Update database if userId is provided
    if (userId) {
      logStep("Updating user subscription in database", { userId });
      
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          refunded_at: refundId ? new Date().toISOString() : null,
          refund_id: refundId,
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('stripe_subscription_id', subscriptionId);

      if (updateError) {
        logStep("Database update error", { error: updateError });
        throw new Error(`Failed to update subscription in database: ${updateError.message}`);
      }

      logStep("Successfully updated database");
    }

    const response = {
      success: true,
      message: "Subscription canceled and refund processed successfully",
      data: {
        subscriptionId: canceledSubscription.id,
        subscriptionStatus: canceledSubscription.status,
        refundId,
        refundAmount: refundId ? invoices.data[0]?.amount_paid : null,
        canceledAt: new Date().toISOString(),
      }
    };

    logStep("Operation completed successfully", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      message: "Failed to process refund and cancellation"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
