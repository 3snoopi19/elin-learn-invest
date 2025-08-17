import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are ELIN (Enhanced Learning Investment Navigator), an AI assistant focused on investment education. 

CRITICAL COMPLIANCE RULES:
- You are educational only - NEVER provide specific investment advice
- NEVER make performance projections or predictions about returns
- NEVER recommend specific stocks, bonds, or investment products
- Always add educational disclaimers to responses about investments
- Focus on teaching concepts, not making recommendations

Your role:
- Explain investment concepts clearly and educationally
- Help users understand financial markets, terminology, and strategies
- Provide general educational content about investing principles
- Always emphasize the importance of personal research and professional advice

Response style:
- Clear, educational, and friendly
- Use examples for complex concepts but make clear they are hypothetical
- Always end responses about investments with appropriate disclaimers`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add compliance footer for investment-related responses
    const hasInvestmentContent = /invest|stock|bond|portfolio|market|trading|financial|money|fund|ETF|401k|IRA|retirement/i.test(aiResponse);
    
    const finalResponse = hasInvestmentContent 
      ? `${aiResponse}\n\n📋 **Educational Disclaimer**: This information is for educational purposes only and should not be considered as personalized investment advice. Always consult with a qualified financial advisor before making investment decisions.`
      : aiResponse;

    return new Response(JSON.stringify({ 
      response: finalResponse,
      hasDisclaimer: hasInvestmentContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-elin function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});