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
const IP_LIMIT = { windowMs: 60000, maxRequests: 120 }; // 120 req/min for market data (higher for real-time updates)

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
// Input Validation
// ============================================
const symbolSchema = z.string()
  .max(10)
  .transform(s => s.trim().toUpperCase())
  .refine(s => /^[A-Z0-9.-]*$/.test(s), 'Invalid symbol format');

const symbolsQuerySchema = z.string()
  .max(200)
  .transform(s => 
    s.split(',')
      .map(sym => sym.trim().toUpperCase())
      .filter(sym => /^[A-Z0-9.-]+$/.test(sym) && !sym.includes('-')) // Filter out crypto symbols
      .slice(0, 10)
  );

interface NormalizedQuote {
  symbol: string;
  price: number;
  changePct: number;
  changeAbs: number;
  prevClose: number;
  high: number;
  low: number;
  time: number;
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

// In-memory cache with TTL
const cache = new Map<string, { data: NormalizedQuote; expires: number }>();
const CACHE_TTL = 30000; // 30 seconds

function normalizeQuote(symbol: string, finnhubData: FinnhubQuote): NormalizedQuote {
  return {
    symbol: symbol.toUpperCase(),
    price: finnhubData.c,
    changePct: finnhubData.dp,
    changeAbs: finnhubData.d,
    prevClose: finnhubData.pc,
    high: finnhubData.h,
    low: finnhubData.l,
    time: finnhubData.t
  };
}

async function fetchQuoteFromFinnhub(symbol: string, apiKey: string): Promise<NormalizedQuote> {
  const cacheKey = symbol.toUpperCase();
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
  const normalized = normalizeQuote(symbol, data);
  
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
    // Input Validation
    // ============================================
    const url = new URL(req.url);
    let symbolsParam: string | null = url.searchParams.get('symbols');
    
    if (!symbolsParam) {
      try {
        const body = await req.json();
        symbolsParam = body?.symbols || null;
      } catch {
        // No body, use defaults
      }
    }

    let symbols: string[];
    if (symbolsParam) {
      const parseResult = symbolsQuerySchema.safeParse(symbolsParam);
      if (!parseResult.success) {
        return new Response(
          JSON.stringify({ error: 'Invalid symbols format. Use comma-separated uppercase stock symbols (max 10).' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      symbols = parseResult.data;
    } else {
      symbols = ['MSFT', 'TSLA', 'AAPL', 'SPY'];
    }

    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid symbols provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching quotes for symbols: ${symbols.join(', ')}`);

    // ============================================
    // API Key Check
    // ============================================
    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Market data service not configured', provider: 'finnhub' }), 
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch quotes in parallel with error handling
    const quotePromises = symbols.map((symbol: string) => 
      fetchQuoteFromFinnhub(symbol, finnhubApiKey).catch(error => {
        console.error(`Error fetching ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
        return { symbol, error: error instanceof Error ? error.message : 'Unknown error' };
      })
    );

    const results = await Promise.all(quotePromises);
    
    const quotes = results.filter(result => !('error' in result)) as NormalizedQuote[];
    const errors = results.filter(result => 'error' in result);
    
    console.log(`Successfully fetched ${quotes.length} quotes, ${errors.length} errors`);

    const formattedQuotes = quotes.map(quote => ({
      symbol: quote.symbol,
      price: quote.price,
      changePct: quote.changePct,
      changeAbs: quote.changeAbs,
      prevClose: quote.prevClose,
      time: quote.time
    }));

    return new Response(
      JSON.stringify(formattedQuotes), 
      {
        headers: { 
          ...corsHeaders,
          ...rateLimitHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        }
      }
    );

  } catch (error) {
    console.error('Error in market-quotes function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', provider: 'finnhub' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
