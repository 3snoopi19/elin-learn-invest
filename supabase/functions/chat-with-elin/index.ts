import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const googleApiKey = Deno.env.get('GEMINI_API_KEY');
console.log('Google AI API Key available:', !!googleApiKey);

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
    
    // Server-side input validation
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const sanitizedMessage = message.trim().slice(0, 2000);
    if (!sanitizedMessage) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Received message (sanitized):', sanitizedMessage.substring(0, 100));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are ELIN (Enhanced Learning Investment Navigator), an AI assistant focused on investment education. 

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
- Always end responses about investments with appropriate disclaimers

User message: ${sanitizedMessage}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI API error response:', errorText);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

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
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});