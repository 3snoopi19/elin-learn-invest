import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// Rate Limiting
// ============================================
interface RateLimitEntry { count: number; resetTime: number; }
const ipRateLimits = new Map<string, RateLimitEntry>();
const userRateLimits = new Map<string, RateLimitEntry>();
const IP_LIMIT = { windowMs: 60000, maxRequests: 30 };  // 30 req/min for AI endpoints
const USER_LIMIT = { windowMs: 60000, maxRequests: 50 }; // 50 req/min per user

function checkRateLimit(key: string, store: Map<string, RateLimitEntry>, config: typeof IP_LIMIT): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) { if (now > v.resetTime) store.delete(k); }
  }
  if (!entry || now > entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

// ============================================
// Input Validation Schema
// ============================================
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(10000)
  })).max(50).optional().default([]),
  stream: z.boolean().optional().default(false),
  searchContext: z.string().max(20000).nullable().optional(),
  persona: z.enum(['financial', 'mentor']).optional().default('financial')
});

// ============================================
// Input Sanitization
// ============================================
function sanitizeMessage(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
    .slice(0, 10000);
}

// Enhanced system prompt for ELIN "God Mode" - Financial Analyst
const ELIN_FINANCIAL_PROMPT = `You are ELIN (Enhanced Learning Investment Navigator) - an advanced AI investment educator operating in GOD MODE.

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
- **Adaptive Teaching**: Adjust complexity based on user's questions

📋 CRITICAL COMPLIANCE (ALWAYS FOLLOW):
- You are EDUCATIONAL ONLY - NEVER provide specific investment advice
- NEVER recommend specific stocks, bonds, or investment products
- Always emphasize that past performance doesn't guarantee future results
- Remind users to consult qualified financial advisors for personal decisions

💬 RESPONSE STYLE:
- Be engaging, clear, and thorough
- Use formatting: **bold** for key terms, bullet points for lists
- Include relevant emojis to make content engaging (📈 📊 💡 ⚠️ 🎯)
- Start with a direct answer, then provide depth

Remember: Your goal is to EDUCATE and EMPOWER users to make their own informed decisions.`;

// Success Mentor system prompt
const ELIN_MENTOR_PROMPT = `You are ELIN - a Success Mentor specializing in career growth, life optimization, and personal development.

🚀 CORE IDENTITY:
You are a warm but direct coach who helps people level up their careers and lives. You provide actionable, practical advice backed by psychology and real-world wisdom.

🎯 YOUR EXPERTISE:
1. **Career Advancement**: Asking for raises, promotions, job negotiations, career pivots
2. **Negotiation Skills**: Salary negotiation, rent negotiation, contract discussions
3. **Productivity & Habits**: Overcoming procrastination, building routines, time management
4. **Communication**: Difficult conversations, assertiveness, professional email/message writing
5. **Personal Finance Mindset**: Money psychology, saving habits, lifestyle design
6. **Goal Achievement**: Breaking down big goals, accountability systems, progress tracking
7. **Script Writing**: Creating exact messages/emails people can copy and paste

📝 RESPONSE FORMAT:
ALWAYS provide actionable, bulleted checklists when giving advice. Structure like this:

**Step 1: [Action]**
• Specific sub-task
• Specific sub-task

**Step 2: [Action]**
• Specific sub-task

When asked to generate scripts, use this format:
📝 **Your Script:**
---
[The exact text they should copy/paste]
---

💡 **Pro Tips:**
• Delivery advice
• Timing advice

🎨 STYLE:
- Be encouraging but practical - no toxic positivity
- Give specific, concrete advice (not vague platitudes)
- Use the user's specific situation in your advice
- Include exact words/phrases they can use
- Be confident and direct
- Use emojis sparingly to keep it professional

⚠️ BOUNDARIES:
- For legal advice: "I can help you prepare, but consult a lawyer for legal matters"
- For medical/mental health: "Consider speaking with a professional for personalized support"
- For financial specifics: "For detailed financial planning, a financial advisor can help"

Remember: Your job is to give people the confidence and tools to take action. Be their coach in their corner.`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================
    // Rate Limiting
    // ============================================
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 'unknown';
    const authHeader = req.headers.get('Authorization');
    const userId = authHeader ? `token:${authHeader.slice(-20)}` : null;

    const ipResult = checkRateLimit(`ip:${ip}`, ipRateLimits, IP_LIMIT);
    const userResult = userId ? checkRateLimit(`user:${userId}`, userRateLimits, USER_LIMIT) : { allowed: true, remaining: 50, resetIn: 60000 };

    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(IP_LIMIT.maxRequests),
      'X-RateLimit-Remaining': String(Math.min(ipResult.remaining, userResult.remaining)),
      'X-RateLimit-Reset': String(Math.ceil(Math.min(ipResult.resetIn, userResult.resetIn) / 1000)),
    };

    if (!ipResult.allowed || !userResult.allowed) {
      const retryAfter = Math.ceil(Math.max(ipResult.resetIn, userResult.resetIn) / 1000);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.', retryAfter }),
        { 
          status: 429, 
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) }
        }
      );
    }

    // ============================================
    // Input Validation
    // ============================================
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parseResult = chatMessageSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory, stream, searchContext, persona } = parseResult.data;
    
    // Sanitize the message
    const sanitizedMessage = sanitizeMessage(message);
    if (!sanitizedMessage) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty after sanitization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // API Key Check
    // ============================================
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Select system prompt based on persona
    const systemPrompt = persona === 'mentor' ? ELIN_MENTOR_PROMPT : ELIN_FINANCIAL_PROMPT;
    
    console.log('ELIN - Persona:', persona, '| Message:', sanitizedMessage.substring(0, 100), '| Stream:', stream);

    // Build conversation messages with history and search context
    let enhancedMessage = sanitizedMessage;
    if (searchContext) {
      enhancedMessage = `[Web Search Results]\n${searchContext}\n\n[User Question]\n${sanitizedMessage}`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: sanitizeMessage(msg.content).slice(0, 2000)
      })),
      { role: 'user', content: enhancedMessage }
    ];

    // Streaming response
    if (stream) {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lovable AI streaming error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), {
            status: 429,
            headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`AI error: ${response.status}`);
      }

      // Return the stream directly
      return new Response(response.body, {
        headers: { 
          ...corsHeaders, 
          ...rateLimitHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        },
      });
    }

    // Non-streaming response (original behavior)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
          status: 429,
          headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Fallback to flash model
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
        throw new Error(`AI error: ${response.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      const fallbackAiResponse = fallbackData.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';
      
      return new Response(JSON.stringify({ 
        response: addDisclaimer(fallbackAiResponse),
        hasDisclaimer: true,
        model: 'gemini-2.5-flash',
        mode: 'god'
      }), {
        headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return new Response(JSON.stringify({ 
      response: addDisclaimer(aiResponse),
      hasDisclaimer: true,
      model: 'gemini-2.5-pro',
      mode: 'god'
    }), {
      headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ELIN error:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request'
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
