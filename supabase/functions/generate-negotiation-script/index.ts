import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  corsHeaders, 
  applyRateLimit, 
  handleCors, 
  errorResponse, 
  successResponse,
  sanitizeString 
} from "../_shared/security.ts";

// Input validation schema
const negotiationRequestSchema = z.object({
  subscription_name: z.string().min(1).max(100).transform(s => sanitizeString(s, 100)),
  current_cost: z.number().positive().max(10000),
  provider_name: z.string().min(1).max(100).transform(s => sanitizeString(s, 100)),
  contract_type: z.enum(['monthly', 'annual', 'multi-year', 'unknown']).optional().default('unknown'),
});

const SYSTEM_PROMPT = `You are a ruthless consumer protection lawyer who specializes in helping consumers cancel subscriptions and negotiate lower rates. You have extensive knowledge of consumer protection laws including:

- California's SB-313 Auto-Renewal Law (requires clear disclosure and easy cancellation)
- FTC's "Click-to-Cancel" Rule (companies must make cancellation as easy as signup)
- GDPR "Right to be Forgotten" and "Right to Erasure" (for EU residents)
- State-specific consumer protection laws
- The Restore Online Shoppers' Confidence Act (ROSCA)
- Various state automatic renewal laws

You are aggressive, legally precise, and always advocate fiercely for the consumer. Your tone is firm but professional - you cite specific laws and regulations to intimidate companies into compliance.`;

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Apply strict rate limiting (sensitive AI operation)
  const rateLimitResult = applyRateLimit(req, null, 'strict');
  if (!rateLimitResult.allowed && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    
    // Validate input
    const parseResult = negotiationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.errors);
      return errorResponse(
        `Invalid input: ${parseResult.error.errors.map(e => e.message).join(', ')}`,
        400,
        rateLimitResult.headers
      );
    }

    const { subscription_name, current_cost, provider_name, contract_type } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return errorResponse('AI service not configured', 500, rateLimitResult.headers);
    }

    const userPrompt = `Generate two documents to help me deal with my ${subscription_name} subscription from ${provider_name}:

Current monthly cost: $${current_cost.toFixed(2)}
Contract type: ${contract_type}

Please generate:

1. **CANCELLATION EMAIL**: A formal, legally potent email demanding immediate cancellation. Include:
   - Specific legal citations (SB-313, FTC Click-to-Cancel rule, ROSCA, etc.)
   - Clear demand for written confirmation of cancellation
   - Warning about reporting to the FTC/state attorney general if not complied with
   - Request for prorated refund if applicable
   - Firm but professional tone

2. **NEGOTIATION PHONE SCRIPT**: A detailed phone script I can read when calling to negotiate a lower rate. Include:
   - Opening statement establishing myself as a long-term customer
   - Specific competitor pricing to cite (make realistic estimates)
   - Escalation phrases to reach retention department
   - Negotiation tactics (threat to cancel, mention recording the call)
   - Target discount percentage (aim for 25-40% off)
   - Specific phrases to counter common objections
   - Final ultimatum if they don't offer a discount

Format your response as JSON with this exact structure:
{
  "cancellation_email": {
    "subject": "email subject line",
    "body": "full email body with proper formatting"
  },
  "negotiation_script": {
    "opening": "opening statement",
    "key_points": ["point 1", "point 2", ...],
    "competitor_mentions": ["competitor offer 1", "competitor offer 2"],
    "escalation_phrases": ["phrase 1", "phrase 2", ...],
    "closing_ultimatum": "final statement if they don't comply",
    "full_script": "complete word-for-word script to read"
  },
  "legal_references": ["Law 1: description", "Law 2: description", ...]
}`;

    console.log(`Generating negotiation script for ${subscription_name} (${provider_name})`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return errorResponse('AI service is busy. Please try again in a moment.', 429, rateLimitResult.headers);
      }
      if (response.status === 402) {
        return errorResponse('AI credits exhausted. Please try again later.', 402, rateLimitResult.headers);
      }
      
      return errorResponse('Failed to generate negotiation script', 500, rateLimitResult.headers);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return errorResponse('Failed to generate content', 500, rateLimitResult.headers);
    }

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Return raw content if JSON parsing fails
      parsedContent = { raw_content: content };
    }

    console.log('Successfully generated negotiation script');

    return successResponse({
      success: true,
      subscription_name,
      provider_name,
      current_cost,
      ...parsedContent
    }, rateLimitResult.headers);

  } catch (error) {
    console.error('Error in generate-negotiation-script:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
});
