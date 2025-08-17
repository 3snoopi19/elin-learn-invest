import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TickerItem {
  symbol: string;
  price: number;
  changePct: number;
  direction: 'up' | 'down' | 'flat';
}

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
}

// Default symbols for ticker
const DEFAULT_SYMBOLS = ['MSFT', 'TSLA', 'AAPL', 'SPY', 'NVDA', 'GOOGL'];

// In-memory cache
const cache = new Map<string, { data: TickerItem; expires: number }>();
const CACHE_TTL = 30000; // 30 seconds

function normalizeTickerItem(symbol: string, finnhubData: FinnhubQuote): TickerItem {
  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (finnhubData.dp > 0.1) direction = 'up';
  else if (finnhubData.dp < -0.1) direction = 'down';

  return {
    symbol: symbol.toUpperCase(),
    price: finnhubData.c,
    changePct: finnhubData.dp,
    direction
  };
}

async function fetchTickerFromFinnhub(symbol: string, apiKey: string): Promise<TickerItem> {
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
  const normalized = normalizeTickerItem(symbol, data);
  
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
    const customSymbols = url.searchParams.get('symbols')?.split(',');
    const symbols = customSymbols || DEFAULT_SYMBOLS;

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

    // Fetch ticker data in parallel
    const tickerPromises = symbols.map(symbol => 
      fetchTickerFromFinnhub(symbol, finnhubApiKey).catch(error => {
        console.error(`Error fetching ${symbol}:`, error);
        return null;
      })
    );

    const results = await Promise.all(tickerPromises);
    const tickers = results.filter(Boolean) as TickerItem[];

    console.log(`Fetched ${tickers.length} ticker items`);

    return new Response(
      JSON.stringify({ 
        tickers,
        timestamp: Date.now(),
        refreshInterval: 30
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