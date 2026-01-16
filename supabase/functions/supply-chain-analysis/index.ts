import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
const IP_LIMIT = { windowMs: 60000, maxRequests: 20 }; // 20 req/min - expensive AI call
const USER_LIMIT = { windowMs: 60000, maxRequests: 30 };

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
const supplyChainSchema = z.object({
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long')
    .transform(s => s.trim())
    .refine(s => /^[a-zA-Z0-9\s.&,'-]+$/.test(s), 'Invalid characters in company name')
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
    const authHeader = req.headers.get('Authorization');
    const userId = authHeader ? `token:${authHeader.slice(-20)}` : null;

    const ipResult = checkRateLimit(`ip:${ip}`, ipRateLimits, IP_LIMIT);
    const userResult = userId ? checkRateLimit(`user:${userId}`, userRateLimits, USER_LIMIT) : { allowed: true, remaining: 30, resetIn: 60000 };

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

    const parseResult = supplyChainSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { company } = parseResult.data;
    console.log('Received request for company (validated):', company);

    // ============================================
    // API Key Check
    // ============================================
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Analyze the supply chain for "${company}". Provide a detailed but concise JSON response with this exact structure:
{
  "companyName": "Full company name",
  "ticker": "Stock ticker if applicable",
  "industry": "Primary industry",
  "suppliers": [
    {
      "name": "Supplier company name",
      "ticker": "Ticker if public, null if private",
      "category": "What they supply (e.g., 'Batteries', 'Semiconductors', 'Raw Materials')",
      "description": "Brief description of the relationship"
    }
  ],
  "customers": [
    {
      "name": "Customer or market segment name",
      "ticker": "Ticker if public company, null otherwise",
      "category": "Type of customer (e.g., 'B2B Partner', 'Retail Market', 'Government')",
      "description": "Brief description of the relationship"
    }
  ],
  "summary": "2-3 sentence overview of the company's position in its supply chain"
}

Provide 4-6 key suppliers and 4-6 major customers/markets. Focus on the most significant relationships. Return ONLY valid JSON, no markdown or additional text.`;

    console.log('Calling Lovable AI Gateway for supply chain analysis:', company);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial analyst specializing in supply chain analysis. Always respond with valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    console.log('Lovable AI Gateway response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze supply chain' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Gateway response received');

    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      console.error('No content in AI response:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'No analysis generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response, stripping any markdown formatting
    let supplyChainData;
    try {
      let cleaned = textContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
      
      supplyChainData = JSON.parse(cleaned);
      console.log('Parsed supply chain data successfully');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', textContent.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse supply chain data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supplyChainData.companyName || !supplyChainData.suppliers || !supplyChainData.customers) {
      console.error('Invalid data structure:', supplyChainData);
      return new Response(
        JSON.stringify({ error: 'Incomplete supply chain data received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(supplyChainData),
      { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
