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
    const { company } = await req.json();
    
    // Server-side input validation
    if (!company || typeof company !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Company name or ticker is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const sanitizedCompany = company.trim().slice(0, 100);
    if (!sanitizedCompany) {
      return new Response(
        JSON.stringify({ error: 'Company name cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate characters - allow alphanumeric, spaces, and common company name chars
    if (!/^[a-zA-Z0-9\s.&,'-]+$/.test(sanitizedCompany)) {
      return new Response(
        JSON.stringify({ error: 'Invalid characters in company name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Received request for company (sanitized):', sanitizedCompany);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Analyze the supply chain for "${sanitizedCompany}". Provide a detailed but concise JSON response with this exact structure:
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

    console.log('Calling Lovable AI Gateway for supply chain analysis:', sanitizedCompany);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial analyst specializing in supply chain analysis. Always respond with valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    console.log('Lovable AI Gateway response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze supply chain' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Gateway response received');

    const textContent = data.choices?.[0]?.message?.content;
    if (!textContent) {
      console.error('No content in AI response:', JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: 'No analysis generated. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response, stripping any markdown formatting
    let supplyChainData;
    try {
      let cleaned = textContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
      
      supplyChainData = JSON.parse(cleaned);
      console.log('Parsed supply chain data successfully');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', textContent.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse supply chain data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supplyChainData.companyName || !supplyChainData.suppliers || !supplyChainData.customers) {
      console.error('Invalid data structure:', supplyChainData);
      return new Response(
        JSON.stringify({ error: 'Incomplete supply chain data received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(supplyChainData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
