
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

    const { householdId } = await req.json();
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Generating daily coaching moment for household: ${householdId}, date: ${today}`);
    
    // Check if daily moment already exists for today
    const { data: existingMoment, error: checkError } = await supabaseClient
      .from('mini_coach_moments')
      .select('id')
      .eq('household_id', householdId)
      .eq('generated_for_date', today)
      .eq('is_daily_auto', true)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing moments:', checkError);
      throw checkError;
    }

    if (existingMoment && existingMoment.length > 0) {
      console.log('Daily moment already exists for today');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Daily moment already exists for today',
          momentId: existingMoment[0].id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get household data for personalization
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const [winsResponse, goalsResponse, choresResponse] = await Promise.all([
      supabaseClient
        .from('weekly_wins')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', yesterday.toISOString()),
      
      supabaseClient
        .from('weekly_goals')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', yesterday.toISOString()),
        
      supabaseClient
        .from('chores')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', yesterday.toISOString())
    ]);

    const wins = winsResponse.data || [];
    const goals = goalsResponse.data || [];
    const chores = choresResponse.data || [];

    console.log(`Found ${wins.length} wins, ${goals.length} goals, ${chores.length} chores for personalization`);

    // Generate daily coaching insight
    const dailyInsight = generateDailyInsight(wins, goals, chores);

    // Insert the daily moment with proper schema handling
    const { data: insertedMoment, error: insertError } = await supabaseClient
      .from('mini_coach_moments')
      .insert({
        household_id: householdId,
        content: dailyInsight.content,
        coaching_type: dailyInsight.type,
        generated_for_date: today,
        generated_for_week: null, // Explicitly set to null for daily auto-generated moments
        is_daily_auto: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting daily moment:', insertError);
      throw insertError;
    }

    console.log('Successfully generated daily coaching moment:', insertedMoment.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated: 1,
        insight: dailyInsight,
        momentId: insertedMoment.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-daily-coach function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Generate personalized daily insight
function generateDailyInsight(wins: any[], goals: any[], chores: any[]) {
  const dayOfWeek = new Date().getDay();
  const weekStart = dayOfWeek === 0 || dayOfWeek === 1; // Sunday or Monday
  const weekEnd = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
  
  const completedGoals = goals.filter(g => g.completed).length;
  const completedChores = chores.filter(c => c.completed).length;
  const recentWins = wins.length;

  // Different insights based on recent activity and day of week
  if (weekStart) {
    return {
      content: "🌅 Fresh week, fresh possibilities! Set your intentions and make this week count - every small step leads to big achievements.",
      type: "motivation"
    };
  }
  
  if (weekEnd && recentWins > 0) {
    return {
      content: `🎉 What a week! You've celebrated ${recentWins} win${recentWins > 1 ? 's' : ''} - take time to appreciate how far you've come!`,
      type: "celebration"
    };
  }
  
  if (completedChores > 0 && completedGoals > 0) {
    return {
      content: `💪 You're crushing it! ${completedChores} chore${completedChores > 1 ? 's' : ''} and ${completedGoals} goal${completedGoals > 1 ? 's' : ''} completed recently. Keep that momentum flowing!`,
      type: "celebration"
    };
  }
  
  if (goals.length > completedGoals && goals.length > 0) {
    return {
      content: `🎯 You have ${goals.length - completedGoals} goal${goals.length - completedGoals > 1 ? 's' : ''} waiting for your attention. Break them into small steps and tackle one today!`,
      type: "motivation"
    };
  }
  
  const dailyMotivation = [
    "🌟 Today is a canvas waiting for your unique masterpiece. What will you create?",
    "💝 Small acts of kindness ripple through families. Spread some joy today!",
    "🚀 Progress isn't about perfection - it's about showing up consistently. You've got this!",
    "🌈 Every challenge is a chance to grow stronger together as a family.",
    "⭐ Your family is lucky to have someone who cares enough to keep trying every day.",
    "🌱 Growth happens in the quiet moments between big achievements. Celebrate the small wins too!",
    "🏠 Home is where love lives, laughter never ends, and memories are made every day.",
    "💪 The strongest families aren't perfect - they're the ones who support each other through everything."
  ];
  
  const randomIndex = Math.floor(Math.random() * dailyMotivation.length);
  
  return {
    content: dailyMotivation[randomIndex],
    type: "motivation"
  };
}
