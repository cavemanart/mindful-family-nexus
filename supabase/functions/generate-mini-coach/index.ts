
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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { householdId } = await req.json();
    
    // Get household data for the past week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Fetch recent wins, goals, and chores data
    const [winsResponse, goalsResponse, choresResponse] = await Promise.all([
      supabaseClient
        .from('weekly_wins')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', lastWeek.toISOString()),
      
      supabaseClient
        .from('weekly_goals')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', lastWeek.toISOString()),
        
      supabaseClient
        .from('chores')
        .select('*')
        .eq('household_id', householdId)
        .gte('created_at', lastWeek.toISOString())
    ]);

    const wins = winsResponse.data || [];
    const goals = goalsResponse.data || [];
    const chores = choresResponse.data || [];

    // Prepare data for AI analysis
    const familyData = {
      wins: wins.map(w => ({ title: w.title, description: w.description, addedBy: w.added_by })),
      goals: goals.map(g => ({ 
        title: g.title, 
        assignedTo: g.assigned_to, 
        completed: g.completed,
        description: g.description 
      })),
      chores: chores.map(c => ({ 
        title: c.title, 
        assignedTo: c.assigned_to, 
        completed: c.completed,
        points: c.points 
      }))
    };

    // Generate coaching insights with OpenAI
    const prompt = `
    As a family coach, analyze this week's family data and generate 2-3 personalized coaching insights:

    Family Wins: ${JSON.stringify(familyData.wins)}
    Goals: ${JSON.stringify(familyData.goals)}
    Chores: ${JSON.stringify(familyData.chores)}

    Generate coaching moments that are:
    - Encouraging and positive
    - Specific to the family's patterns
    - Actionable and helpful
    - 2-3 sentences each
    - Different types: celebration, motivation, improvement tip

    Return as JSON array with format:
    [
      {
        "content": "coaching message here",
        "coaching_type": "celebration|motivation|improvement"
      }
    ]
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful family coach AI that provides encouraging, specific, and actionable insights based on family activity data.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    let coachingMoments;
    
    try {
      coachingMoments = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback if JSON parsing fails
      coachingMoments = [
        {
          content: "Great work this week! Keep building on your family's momentum with consistency and celebration.",
          coaching_type: "motivation"
        }
      ];
    }

    // Save coaching moments to database
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week

    const momentsToInsert = coachingMoments.map((moment: any) => ({
      household_id: householdId,
      content: moment.content,
      coaching_type: moment.coaching_type || 'general',
      generated_for_week: weekStart.toISOString().split('T')[0]
    }));

    const { error: insertError } = await supabaseClient
      .from('mini_coach_moments')
      .insert(momentsToInsert);

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        generated: momentsToInsert.length,
        moments: momentsToInsert 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-mini-coach function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
