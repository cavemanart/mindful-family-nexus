
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { plan_type } = await req.json();
    logStep("Request data", { plan_type, userEmail: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    // Define prices based on plan -- UPDATED HERE!
    const priceData = plan_type === 'pro_annual' ? {
      currency: "usd",
      product_data: { name: "Family Pro Annual" },
      unit_amount: 4999, // $49.99
      recurring: { interval: "year" },
    } : {
      currency: "usd", 
      product_data: { name: "Family Pro" },
      unit_amount: 499, // $4.99
      recurring: { interval: "month" },
    };

    // Get origin from request or use fallback
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "http://localhost:3000";
    logStep("Using origin", { origin });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price_data: priceData, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: { 
        user_id: user.id,
        plan_type: plan_type 
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
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
