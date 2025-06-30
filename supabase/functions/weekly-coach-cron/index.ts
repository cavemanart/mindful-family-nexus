
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

    // Get all households with active subscriptions
    const { data: households, error: householdsError } = await supabaseClient
      .rpc('get_households_with_active_subscriptions');

    if (householdsError) {
      console.error('Error fetching households:', householdsError);
      throw householdsError;
    }

    let processedCount = 0;
    let errors = [];

    // Process each household
    for (const household of households || []) {
      try {
        // Check if coaching moments already exist for this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const { data: existingMoments } = await supabaseClient
          .from('mini_coach_moments')
          .select('id')
          .eq('household_id', household.id)
          .eq('generated_for_week', weekStart.toISOString().split('T')[0])
          .limit(1);

        if (existingMoments && existingMoments.length > 0) {
          console.log(`Skipping household ${household.id} - already has moments for this week`);
          continue;
        }

        // Generate coaching moments for this household
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-mini-coach`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ householdId: household.id })
        });

        if (response.ok) {
          processedCount++;
          console.log(`Successfully generated coaching moments for household ${household.id}`);
        } else {
          const error = await response.text();
          errors.push(`Household ${household.id}: ${error}`);
        }
      } catch (error) {
        errors.push(`Household ${household.id}: ${error.message}`);
      }
    }

    // Clean up expired moments
    const { data: cleanupResult } = await supabaseClient
      .rpc('cleanup_expired_coaching_moments');

    return new Response(
      JSON.stringify({
        success: true,
        processedHouseholds: processedCount,
        totalHouseholds: households?.length || 0,
        errors: errors,
        cleanedUp: cleanupResult || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weekly-coach-cron:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
