import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to clean and parse JSON from Gemini response
function parseGeminiResponse(text: string): any {
  console.log('Raw Gemini response:', text);
  
  // Remove markdown code blocks if present
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // Try to find JSON object boundaries
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }
  
  console.log('Cleaned JSON string:', cleaned);
  
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company } = await req.json();
    console.log('Received request for company:', company);

    if (!company) {
      console.error('No company provided in request');
      return new Response(
        JSON.stringify({ error: 'Company name or ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured. Please add GEMINI_API_KEY to your Supabase secrets.' }),
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

    let response;
    try {
      response = await fetch(
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
    } catch (fetchError) {
      console.error('Network error calling Gemini API:', fetchError);
      return new Response(
        JSON.stringify({ error: `Network error: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', response.status, errorText);
      
      // Parse error for more specific messages
      let errorMessage = 'Failed to analyze supply chain';
      if (response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again in a minute.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY configuration.';
      } else if (response.status >= 500) {
        errorMessage = 'Gemini API is temporarily unavailable. Please try again later.';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let data;
    try {
      data = await response.json();
      console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    } catch (jsonError) {
      console.error('Failed to parse Gemini response as JSON:', jsonError);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from Gemini API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error('No text content in Gemini response:', JSON.stringify(data, null, 2));
      
      // Check for blocked content
      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        return new Response(
          JSON.stringify({ error: 'Content was blocked by safety filters. Try a different company.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'No analysis generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response with robust cleaning
    let supplyChainData;
    try {
      supplyChainData = parseGeminiResponse(textContent);
      console.log('Parsed supply chain data:', JSON.stringify(supplyChainData, null, 2));
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw text content:', textContent);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse supply chain data. The AI response was not valid JSON.',
          rawResponse: textContent.substring(0, 500) // Include first 500 chars for debugging
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!supplyChainData.companyName || !supplyChainData.suppliers || !supplyChainData.customers) {
      console.error('Invalid supply chain data structure:', supplyChainData);
      return new Response(
        JSON.stringify({ error: 'Incomplete supply chain data received. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Supply chain analysis complete for:', company);

    return new Response(
      JSON.stringify(supplyChainData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in supply-chain-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
