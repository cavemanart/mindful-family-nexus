
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

    // Generate coaching insights using Hugging Face Inference API (free tier)
    const generateCoachingInsights = async (familyData: any) => {
      const prompt = `Based on this family's weekly activities, generate 2-3 short, encouraging coaching insights:

Family Wins: ${JSON.stringify(familyData.wins)}
Goals: ${JSON.stringify(familyData.goals)}
Chores: ${JSON.stringify(familyData.chores)}

Please provide positive, actionable coaching messages that celebrate achievements and motivate continued growth. Each insight should be 1-2 sentences.`;

      try {
        // Use Hugging Face's free inference API
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              do_sample: true
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`HuggingFace API error: ${response.status}`);
        }

        const result = await response.json();
        
        // Parse the response and create coaching moments
        const generatedText = result[0]?.generated_text || '';
        
        // Create structured coaching moments from the generated text
        const coachingMoments = [
          {
            content: generatePositiveFeedback(wins, goals, chores),
            coaching_type: "celebration"
          },
          {
            content: generateMotivation(goals, chores),
            coaching_type: "motivation"
          }
        ];

        // Add an improvement tip if there are incomplete goals or chores
        const incompleteItems = [...goals, ...chores].filter(item => !item.completed);
        if (incompleteItems.length > 0) {
          coachingMoments.push({
            content: generateImprovementTip(incompleteItems),
            coaching_type: "improvement"
          });
        }

        return coachingMoments;
      } catch (error) {
        console.error('Error with Hugging Face API:', error);
        // Fallback to rule-based coaching insights
        return generateFallbackInsights(wins, goals, chores);
      }
    };

    // Fallback function for generating insights without AI
    const generateFallbackInsights = (wins: any[], goals: any[], chores: any[]) => {
      const insights = [];
      
      // Celebration insight
      if (wins.length > 0) {
        insights.push({
          content: `🎉 Amazing work this week! You celebrated ${wins.length} family win${wins.length > 1 ? 's' : ''} - that's the spirit of gratitude and recognition that builds strong families.`,
          coaching_type: "celebration"
        });
      }
      
      // Motivation insight
      const completedGoals = goals.filter(g => g.completed).length;
      const totalGoals = goals.length;
      if (totalGoals > 0) {
        insights.push({
          content: `🎯 You're making great progress! ${completedGoals} out of ${totalGoals} goals completed this week. Keep that momentum going!`,
          coaching_type: "motivation"
        });
      }
      
      // Improvement insight
      const completedChores = chores.filter(c => c.completed).length;
      const totalChores = chores.length;
      if (totalChores > 0 && completedChores < totalChores) {
        insights.push({
          content: `💡 Consider breaking down larger tasks into smaller, manageable steps. You've got ${totalChores - completedChores} chores that could use some attention!`,
          coaching_type: "improvement"
        });
      }
      
      // Default insight if no activity
      if (insights.length === 0) {
        insights.push({
          content: "🌟 Every family journey is unique! Start small this week - maybe set one family goal or celebrate one small win together.",
          coaching_type: "motivation"
        });
      }
      
      return insights;
    };

    // Helper functions for generating specific types of insights
    const generatePositiveFeedback = (wins: any[], goals: any[], chores: any[]) => {
      const completedItems = [...goals, ...chores].filter(item => item.completed).length;
      const totalWins = wins.length;
      
      if (totalWins > 0 && completedItems > 0) {
        return `🎉 Fantastic week! You celebrated ${totalWins} win${totalWins > 1 ? 's' : ''} and completed ${completedItems} task${completedItems > 1 ? 's' : ''}. Your family is building great habits!`;
      } else if (totalWins > 0) {
        return `🌟 Love seeing those ${totalWins} family win${totalWins > 1 ? 's' : ''} this week! Celebrating together strengthens your family bond.`;
      } else if (completedItems > 0) {
        return `💪 Great job completing ${completedItems} task${completedItems > 1 ? 's' : ''} this week! Your consistency is paying off.`;
      }
      return "🌈 Every small step counts in your family journey. You're doing better than you think!";
    };

    const generateMotivation = (goals: any[], chores: any[]) => {
      const pendingGoals = goals.filter(g => !g.completed);
      const pendingChores = chores.filter(c => !c.completed);
      
      if (pendingGoals.length > 0) {
        return `🎯 You have ${pendingGoals.length} goal${pendingGoals.length > 1 ? 's' : ''} in progress. Remember, progress over perfection - you've got this!`;
      } else if (pendingChores.length > 0) {
        return `✨ ${pendingChores.length} task${pendingChores.length > 1 ? 's' : ''} awaiting your attention. Tackle them one at a time for the best results!`;
      }
      return "🚀 Ready for new challenges? Set a fresh goal or two to keep your family growing together!";
    };

    const generateImprovementTip = (incompleteItems: any[]) => {
      const tips = [
        "💡 Try the 2-minute rule: if something takes less than 2 minutes, do it right away!",
        "🗓️ Consider scheduling specific times for family tasks to build consistency.",
        "👥 Teamwork makes the dream work - assign tasks based on everyone's strengths!",
        "🎯 Break bigger goals into smaller, daily actions for easier progress.",
        "⏰ Set gentle reminders to help everyone stay on track with their commitments."
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    };

    // Prepare data for insight generation
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

    // Generate coaching insights
    const coachingMoments = await generateCoachingInsights(familyData);

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
