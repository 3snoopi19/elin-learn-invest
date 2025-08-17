import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TickerQuote {
  symbol: string;
  price: number;
  changePct: number;
  direction: 'up' | 'down' | 'unchanged';
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

// Default symbols for ticker
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
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  const data: FinnhubQuote = await response.json();
  const normalized = normalizeTickerQuote(symbol, data);
  
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

    // Use default symbols for ticker tape
    const symbols = DEFAULT_SYMBOLS;

    // Fetch quotes in parallel
    const quotePromises = symbols.map(symbol => 
      fetchTickerQuoteFromFinnhub(symbol, finnhubApiKey).catch(error => ({
        symbol: symbol.toUpperCase(),
        price: 0,
        changePct: 0,
        direction: 'unchanged' as const,
        error: error.message
      }))
    );

    const results = await Promise.all(quotePromises);
    
    // Filter out any errors and keep only successful quotes
    const quotes = results.filter(result => !('error' in result)) as TickerQuote[];
    
    console.log(`Fetched ${quotes.length} ticker quotes`);

    return new Response(
      JSON.stringify({ 
        quotes,
        timestamp: Date.now()
      }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      }
    );

  } catch (error) {
    console.error('Error in market-ticker function:', error);
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
