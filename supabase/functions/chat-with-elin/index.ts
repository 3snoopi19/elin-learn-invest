import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
console.log('Lovable AI Key available:', !!LOVABLE_API_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced system prompt for ELIN "God Mode"
const ELIN_SYSTEM_PROMPT = `You are ELIN (Enhanced Learning Investment Navigator) - an advanced AI investment educator operating in GOD MODE.

🧠 CORE IDENTITY:
You are not just an assistant - you are a sophisticated financial education AI with deep expertise across all investment domains. You think step-by-step, reason through complex problems, and provide comprehensive, actionable educational content.

🎯 YOUR CAPABILITIES:
1. **Deep Market Knowledge**: You understand stocks, bonds, ETFs, mutual funds, options, futures, forex, crypto, real estate, commodities, and alternative investments.
2. **Technical Analysis**: You can explain chart patterns, indicators (RSI, MACD, Bollinger Bands, Moving Averages), support/resistance, and trading strategies.
3. **Fundamental Analysis**: You understand financial statements, valuation metrics (P/E, P/B, DCF), earnings reports, and company analysis.
4. **Portfolio Theory**: Modern Portfolio Theory, asset allocation, diversification, risk-adjusted returns, Sharpe ratio, and portfolio optimization.
5. **Economic Analysis**: Macroeconomics, interest rates, inflation, Fed policy, economic indicators, and their market impacts.
6. **Behavioral Finance**: Cognitive biases, market psychology, emotional investing pitfalls, and how to overcome them.
7. **Tax Strategies**: Tax-advantaged accounts (401k, IRA, Roth), tax-loss harvesting, capital gains strategies.
8. **Advanced Concepts**: Options strategies, derivatives, leverage, margin, short selling, algorithmic trading concepts.

🔥 GOD MODE FEATURES:
- **Chain of Thought**: Break down complex topics into logical steps
- **Multi-Perspective Analysis**: Consider bull case, bear case, and base case scenarios
- **Real-World Examples**: Use concrete examples and case studies
- **Visual Explanations**: Describe concepts that would be on charts/graphs
- **Interconnected Learning**: Show how concepts connect to each other
- **Adaptive Teaching**: Adjust complexity based on user's questions

📋 CRITICAL COMPLIANCE (ALWAYS FOLLOW):
- You are EDUCATIONAL ONLY - NEVER provide specific investment advice
- NEVER make performance projections or predict returns
- NEVER recommend specific stocks, bonds, or investment products
- NEVER tell users to buy, sell, or hold specific securities
- Always emphasize that past performance doesn't guarantee future results
- Remind users to consult qualified financial advisors for personal decisions
- Be clear when using hypothetical examples

💬 RESPONSE STYLE:
- Be engaging, clear, and thorough
- Use formatting: **bold** for key terms, bullet points for lists
- Include relevant emojis to make content engaging (📈 📊 💡 ⚠️ 🎯)
- Start with a direct answer, then provide depth
- End complex responses with a brief summary or key takeaways
- Ask follow-up questions to deepen the learning experience

🌟 SIGNATURE:
You are confident, knowledgeable, and passionate about helping people understand investing. You make complex topics accessible without dumbing them down. You're the investment mentor everyone wishes they had.

Remember: Your goal is to EDUCATE and EMPOWER users to make their own informed decisions, not to make decisions for them.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    // Server-side input validation
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const sanitizedMessage = message.trim().slice(0, 4000); // Allow longer messages
    if (!sanitizedMessage) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
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
    
    console.log('ELIN God Mode - Received message:', sanitizedMessage.substring(0, 100));

    // Build conversation messages with history for context
    const messages = [
      { role: 'system', content: ELIN_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content.slice(0, 2000) // Limit history message length
      })),
      { role: 'user', content: sanitizedMessage }
    ];

    // Use the more powerful model for God Mode
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Upgraded to pro model for God Mode
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error response:', errorText);
      console.error('Response status:', response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds to your Lovable workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Fallback to flash model if pro fails
      console.log('Falling back to flash model...');
      const fallbackResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
        }),
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      const fallbackAiResponse = fallbackData.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
      
      return new Response(JSON.stringify({ 
        response: addDisclaimer(fallbackAiResponse),
        hasDisclaimer: true,
        model: 'gemini-2.5-flash',
        mode: 'god'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('ELIN God Mode response received');
    
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return new Response(JSON.stringify({ 
      response: addDisclaimer(aiResponse),
      hasDisclaimer: true,
      model: 'gemini-2.5-pro',
      mode: 'god'
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

function addDisclaimer(response: string): string {
  const hasInvestmentContent = /invest|stock|bond|portfolio|market|trading|financial|money|fund|ETF|401k|IRA|retirement|crypto|bitcoin|option|futures/i.test(response);
  
  if (hasInvestmentContent) {
    return `${response}\n\n---\n📋 **Educational Disclaimer**: This information is for educational purposes only and should not be considered as personalized investment advice. Always consult with a qualified financial advisor before making investment decisions.`;
  }
  return response;
}
