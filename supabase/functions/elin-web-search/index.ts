import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, searchType = 'general' } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Search service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`ELIN Web Search - Query: ${query.substring(0, 100)}, Type: ${searchType}`);

    // Build context-aware search prompt
    const searchPrompt = buildSearchPrompt(query, searchType);

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
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        query: query,
        searchType: searchType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('ELIN Web Search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
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
