
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const { device_id } = await req.json();

  if (!device_id) {
    return new Response(JSON.stringify({ error: "Missing device_id" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("device_id", device_id)
    .eq("is_child_account", true)
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  if (!data) {
    return new Response(JSON.stringify({ error: "No such child" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ child: data }), { headers: corsHeaders });
});
