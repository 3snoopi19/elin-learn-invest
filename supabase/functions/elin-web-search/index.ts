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
const IP_LIMIT = { windowMs: 60000, maxRequests: 30 }; // 30 req/min for search
const USER_LIMIT = { windowMs: 60000, maxRequests: 50 };

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
const webSearchSchema = z.object({
  query: z.string()
    .min(1, 'Query is required')
    .max(500, 'Query too long')
    .transform(s => s.trim()),
  searchType: z.enum(['market', 'news', 'stock', 'general'])
    .optional()
    .default('general')
});

// Input Sanitization
function sanitizeQuery(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 500);
}

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

    const parseResult = webSearchSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, searchType } = parseResult.data;
    const sanitizedQuery = sanitizeQuery(query);

    if (!sanitizedQuery) {
      return new Response(
        JSON.stringify({ error: 'Query cannot be empty after sanitization' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // API Key Check
    // ============================================
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Search service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`ELIN Web Search - Query: ${sanitizedQuery.substring(0, 100)}, Type: ${searchType}`);

    const searchPrompt = buildSearchPrompt(sanitizedQuery, searchType);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are a financial research assistant with access to current market information. 
            Provide accurate, up-to-date information about markets, stocks, economic news, and financial topics.
            Always cite your sources when possible and indicate the date/time relevance of information.
            Be factual and educational - never give investment advice.`
          },
          { role: 'user', content: searchPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const searchResult = data.choices?.[0]?.message?.content || 'No results found.';

    console.log('Search completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        result: searchResult,
        query: sanitizedQuery,
        searchType: searchType
      }),
      { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ELIN Web Search error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSearchPrompt(query: string, searchType: string): string {
  const today = new Date().toISOString().split('T')[0];
  
  switch (searchType) {
    case 'market':
      return `Current date: ${today}
      
User is asking about market data or stock information: "${query}"

Provide current market information including:
- Current price levels and recent movements
- Key market indicators (S&P 500, Nasdaq, Dow)
- Relevant market news and events
- Economic factors affecting markets

Format with clear sections and be specific about timing of data.`;

    case 'news':
      return `Current date: ${today}
      
User is asking about financial news: "${query}"

Provide recent financial news including:
- Latest developments and headlines
- Impact on markets or specific sectors
- Key analyst perspectives
- Timeline of events

Focus on factual reporting, not predictions.`;

    case 'stock':
      return `Current date: ${today}
      
User is asking about a specific stock or company: "${query}"

Provide educational information including:
- Company overview and sector
- Recent news and developments
- Key financial metrics (if publicly available)
- Market context

Remember: Provide education only, no investment recommendations.`;

    default:
      return `Current date: ${today}
      
User query: "${query}"

Provide accurate, current financial information relevant to this query.
Include sources and timing context where applicable.
Focus on education and factual information.`;
  }
}
