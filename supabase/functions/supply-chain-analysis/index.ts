import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company } = await req.json();

    if (!company) {
      return new Response(
        JSON.stringify({ error: 'Company name or ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
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

    console.log('Calling Gemini API for supply chain analysis:', company);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze supply chain' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('No content in Gemini response:', data);
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let supplyChainData;
    try {
      // Clean up potential markdown code blocks
      const cleanedText = textContent.replace(/```json\n?|\n?```/g, '').trim();
      supplyChainData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', textContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse supply chain data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Supply chain analysis complete for:', company);

    return new Response(
      JSON.stringify(supplyChainData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in supply-chain-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
