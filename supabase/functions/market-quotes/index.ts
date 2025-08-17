import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
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
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  const data: FinnhubQuote = await response.json();
  const normalized = normalizeQuote(symbol, data);
  
  // Cache the result
  cache.set(cacheKey, {
    data: normalized,
    expires: Date.now() + CACHE_TTL
  });

  return normalized;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbols = url.searchParams.get('symbols')?.split(',') || [];
    
    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No symbols provided' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate symbols (alphanumeric, hyphen, dot only)
    const validSymbols = symbols.filter(symbol => 
      /^[A-Za-z0-9.-]+$/.test(symbol) && symbol.length <= 10
    );

    if (validSymbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid symbols provided' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch quotes in parallel
    const quotePromises = validSymbols.map(symbol => 
      fetchQuoteFromFinnhub(symbol, finnhubApiKey).catch(error => ({
        symbol: symbol.toUpperCase(),
        error: error.message
      }))
    );

    const results = await Promise.all(quotePromises);
    
    // Separate successful quotes from errors
    const quotes = results.filter(result => !('error' in result)) as NormalizedQuote[];
    const errors = results.filter(result => 'error' in result);

    console.log(`Fetched ${quotes.length} quotes, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        quotes,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: Date.now()
      }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30'
        }
      }
    );

  } catch (error) {
    console.error('Error in market-quotes function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});