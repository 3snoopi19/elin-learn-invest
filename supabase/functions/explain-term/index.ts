import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { term, definition, mode = "eli5" } = await req.json();
    
    if (!term || typeof term !== 'string') {
      return new Response(JSON.stringify({ error: 'Term is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (mode) {
      case "mental-model":
        systemPrompt = "You are a wise mentor who explains mental models in simple, practical terms. Always provide two short applications: one for money and one for life.";
        userPrompt = `Explain the mental model "${term}" (${definition}) in exactly this format:

**Money:** [One sentence explaining how this applies to personal finance and investing]

**Life:** [One sentence explaining how this applies to life decisions and habits]

Keep each sentence under 25 words. Be practical and actionable.`;
        break;

      case "book-summary":
        systemPrompt = "You are a book summarizer who distills key insights into actionable takeaways.";
        userPrompt = `Summarize the key message from "${term}" by ${definition} in exactly this format:

Mindset: [One sentence about the core belief or perspective shift]
Action: [One sentence about what to do differently]
Result: [One sentence about the expected outcome]

Keep each under 20 words. Be practical.`;
        break;

      case "career-roi":
        systemPrompt = "You are a motivational career coach who helps people see the value in self-investment.";
        userPrompt = `Based on this self-improvement investment: ${definition}

Write 2-3 encouraging sentences about why investing in yourself is worthwhile. Reference the specific numbers if helpful. Compare to other investment returns if relevant. Be inspiring but realistic. Keep it under 50 words total.`;
        break;

      default: // eli5
        systemPrompt = "You are a friendly teacher who explains complex financial concepts to a 10-year-old. Use simple words, fun analogies, and relatable examples.";
        userPrompt = `Explain "${term}" in simple terms a 10-year-old would understand.

The formal definition is: "${definition}"

Give a fun, simple explanation using an analogy or example from everyday life. Keep it to 2-3 sentences max.`;
    }

    console.log(`Generating ${mode} explanation for: ${term}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || 'Could not generate explanation.';

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Explain term error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
