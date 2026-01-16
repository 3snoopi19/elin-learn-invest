import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
const IP_LIMIT = { windowMs: 60000, maxRequests: 60 }; // 60 req/min

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
const explainTermSchema = z.object({
  term: z.string()
    .min(1, 'Term is required')
    .max(200, 'Term too long')
    .transform(s => s.trim()),
  definition: z.string()
    .max(1000, 'Definition too long')
    .optional()
    .transform(s => s?.trim()),
  mode: z.enum(['eli5', 'mental-model', 'book-summary', 'career-roi'])
    .optional()
    .default('eli5')
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============================================
    // Rate Limiting
    // ============================================
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 'unknown';
    const ipResult = checkRateLimit(`ip:${ip}`, ipRateLimits, IP_LIMIT);

    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(IP_LIMIT.maxRequests),
      'X-RateLimit-Remaining': String(ipResult.remaining),
      'X-RateLimit-Reset': String(Math.ceil(ipResult.resetIn / 1000)),
    };

    if (!ipResult.allowed) {
      const retryAfter = Math.ceil(ipResult.resetIn / 1000);
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

    const parseResult = explainTermSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { term, definition, mode } = parseResult.data;

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

    let systemPrompt = "";
    let userPrompt = "";

    switch (mode) {
      case "mental-model":
        systemPrompt = "You are a wise mentor who explains mental models in simple, practical terms. Always provide two short applications: one for money and one for life.";
        userPrompt = `Explain the mental model "${term}" ${definition ? `(${definition})` : ''} in exactly this format:

**Money:** [One sentence explaining how this applies to personal finance and investing]

**Life:** [One sentence explaining how this applies to life decisions and habits]

Keep each sentence under 25 words. Be practical and actionable.`;
        break;

      case "book-summary":
        systemPrompt = "You are a book summarizer who distills key insights into actionable takeaways.";
        userPrompt = `Summarize the key message from "${term}" ${definition ? `by ${definition}` : ''} in exactly this format:

Mindset: [One sentence about the core belief or perspective shift]
Action: [One sentence about what to do differently]
Result: [One sentence about the expected outcome]

Keep each under 20 words. Be practical.`;
        break;

      case "career-roi":
        systemPrompt = "You are a motivational career coach who helps people see the value in self-investment.";
        userPrompt = `Based on this self-improvement investment: ${definition || term}

Write 2-3 encouraging sentences about why investing in yourself is worthwhile. Reference the specific numbers if helpful. Compare to other investment returns if relevant. Be inspiring but realistic. Keep it under 50 words total.`;
        break;

      default: // eli5
        systemPrompt = "You are a friendly teacher who explains complex financial concepts to a 10-year-old. Use simple words, fun analogies, and relatable examples.";
        userPrompt = `Explain "${term}" in simple terms a 10-year-old would understand.

${definition ? `The formal definition is: "${definition}"` : ''}

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
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || 'Could not generate explanation.';

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Explain term error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
