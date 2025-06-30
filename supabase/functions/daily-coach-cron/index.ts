
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active households
    const { data: households, error: householdsError } = await supabaseClient
      .from('households')
      .select('id, name');

    if (householdsError) {
      console.error('Error fetching households:', householdsError);
      throw householdsError;
    }

    let processedCount = 0;
    let errors = [];

    // Generate daily coaching moment for each household
    for (const household of households || []) {
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-daily-coach`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ householdId: household.id })
        });

        if (response.ok) {
          processedCount++;
          console.log(`Successfully generated daily moment for household ${household.id}`);
        } else {
          const error = await response.text();
          errors.push(`Household ${household.id}: ${error}`);
        }
      } catch (error) {
        errors.push(`Household ${household.id}: ${error.message}`);
      }
    }

    // Clean up expired moments (older than 24 hours)
    const { data: cleanupResult } = await supabaseClient
      .rpc('cleanup_expired_coaching_moments');

    return new Response(
      JSON.stringify({
        success: true,
        processedHouseholds: processedCount,
        totalHouseholds: households?.length || 0,
        errors: errors,
        cleanedUp: cleanupResult || 0,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in daily-coach-cron:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
