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
    // Parse query parameters or body
    const url = new URL(req.url);
    const symbolsParam = url.searchParams.get('symbols') || (await req.json().catch(() => ({})))?.symbols;
    
    // Filter symbols to exclude crypto symbols with '-' unless crypto endpoint is implemented
    const rawSymbols = symbolsParam?.split(',').map((s: string) => s.trim().toUpperCase()) || ['MSFT', 'TSLA', 'AAPL', 'SPY'];
    const symbols = rawSymbols.filter(symbol => !symbol.includes('-')).slice(0, 10);
    
    console.log(`Fetching quotes for symbols: ${symbols.join(', ')}`);

    const finnhubApiKey = Deno.env.get('FINNHUB_API_KEY');
    if (!finnhubApiKey) {
      console.error('FINNHUB_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          provider: 'finnhub'
        }), 
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch quotes in parallel with error handling
    const quotePromises = symbols.map(symbol => 
      fetchQuoteFromFinnhub(symbol, finnhubApiKey).catch(error => {
        console.error(`Error fetching ${symbol}:`, error.message);
        return {
          symbol,
          error: error.message
        };
      })
    );

    const results = await Promise.all(quotePromises);
    
    // Separate successful quotes from errors
    const quotes = results.filter(result => !('error' in result)) as NormalizedQuote[];
    const errors = results.filter(result => 'error' in result);
    
    console.log(`Successfully fetched ${quotes.length} quotes, ${errors.length} errors`);

    // Return market quote format as specified
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
        provider: 'finnhub',
        message: error.message 
      }), 
      {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});