
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const { device_id, household_id } = await req.json();

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

  try {
    // First, find the child profile by device_id
    const { data: childProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("device_id", device_id)
      .eq("is_child_account", true)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!childProfile) {
      return new Response(JSON.stringify({ error: "No child account found for this device" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // If household_id is provided, validate membership and get role from household_members
    if (household_id) {
      const { data: membershipData, error: membershipError } = await supabase
        .from("household_members")
        .select("role")
        .eq("user_id", childProfile.id)
        .eq("household_id", household_id)
        .maybeSingle();

      if (membershipError) {
        console.error("Membership lookup error:", membershipError);
        return new Response(JSON.stringify({ error: membershipError.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      if (!membershipData) {
        return new Response(JSON.stringify({ 
          error: "Child is not a member of the specified household" 
        }), {
          status: 403,
          headers: corsHeaders,
        });
      }

      // Return child data with household-specific role
      return new Response(JSON.stringify({ 
        child: {
          ...childProfile,
          household_role: membershipData.role
        }
      }), { 
        headers: corsHeaders 
      });
    }

    // If no specific household requested, return child data without household role
    return new Response(JSON.stringify({ 
      child: childProfile
    }), { 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
