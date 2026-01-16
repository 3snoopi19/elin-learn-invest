import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// Rate Limiting
// ============================================
interface RateLimitEntry { count: number; resetTime: number; }
const ipRateLimits = new Map<string, RateLimitEntry>();
const IP_LIMIT = { windowMs: 60000, maxRequests: 120 }; // 120 req/min for ticker (real-time updates)

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

interface TickerQuote {
  symbol: string;
  price: number;
  changePct: number;
  direction: 'up' | 'down' | 'unchanged';
}

interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

// Default symbols for ticker - validated at compile time
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'SPY', 'NVDA', 'GOOGL'];

// In-memory cache
const cache = new Map<string, { data: TickerQuote; expires: number }>();
const CACHE_TTL = 60000; // 1 minute for ticker

function normalizeTickerQuote(symbol: string, finnhubData: FinnhubQuote): TickerQuote {
  const changePct = finnhubData.dp;
  let direction: 'up' | 'down' | 'unchanged' = 'unchanged';
  
  if (changePct > 0) direction = 'up';
  else if (changePct < 0) direction = 'down';

  return {
    symbol: symbol.toUpperCase(),
    price: finnhubData.c,
    changePct: changePct,
    direction
  };
}

async function fetchTickerQuoteFromFinnhub(symbol: string, apiKey: string): Promise<TickerQuote> {
  const cacheKey = `ticker_${symbol.toUpperCase()}`;
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  const data: FinnhubQuote = await response.json();
  const normalized = normalizeTickerQuote(symbol, data);
  
  cache.set(cacheKey, {
    data: normalized,
    expires: Date.now() + CACHE_TTL
  });

  return normalized;
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
    // API Key Check
    // ============================================
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      return new Response(
        JSON.stringify({ error: 'Market data service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use default symbols for ticker tape (no user input needed)
    const symbols = DEFAULT_SYMBOLS;

    // Fetch quotes in parallel
    const quotePromises = symbols.map(symbol => 
      fetchTickerQuoteFromFinnhub(symbol, finnhubApiKey).catch(error => ({
        symbol: symbol.toUpperCase(),
        price: 0,
        changePct: 0,
        direction: 'unchanged' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    );

    const results = await Promise.all(quotePromises);
    const quotes = results.filter(result => !('error' in result)) as TickerQuote[];
    
    console.log(`Fetched ${quotes.length} ticker quotes`);

    return new Response(
      JSON.stringify({ quotes, timestamp: Date.now() }), 
      {
        headers: { 
          ...corsHeaders,
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      }
    );

  } catch (error) {
    console.error('Error in market-ticker function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
