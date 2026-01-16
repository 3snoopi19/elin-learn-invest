import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import {
  corsHeaders,
  handleCors,
  applyRateLimit,
  extractUserId,
  sanitizeString,
  errorResponse,
  successResponse,
} from "../_shared/security.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Validation schema for portfolio holdings
const holdingSchema = z.object({
  ticker: z.string().min(1).max(10).regex(/^[A-Z0-9.-]+$/i),
  shares: z.number().positive().max(1000000000),
  current_value: z.number().min(0).optional(),
  sector: z.string().max(100).optional(),
  asset_class: z.string().max(100).optional(),
});

const portfolioAnalysisSchema = z.object({
  holdings: z.array(holdingSchema).min(1).max(500),
  total_value: z.number().min(0).optional(),
});

const SYSTEM_PROMPT = `You are a "Brutally Honest Wall Street Veteran" - think Simon Cowell meets Warren Buffett. You've seen every market cycle since 1987 and have zero patience for amateur hour portfolios.

Your job is to ROAST the user's portfolio with brutal honesty while providing genuinely useful feedback. Be entertaining but educational.

Analyze for:
1. **Over-concentration**: Too much in one stock, sector, or asset class
2. **Expense Ratio Red Flags**: High-fee ETFs/mutual funds eating returns
3. **Diversification Gaps**: Missing sectors, asset classes, or geographies
4. **Rookie Mistakes**: Meme stocks, FOMO buys, etc.

Your tone should be:
- Brutally honest but not mean-spirited
- Use Wall Street jargon and metaphors
- Make it memorable and quotable
- Include specific numbers and percentages when critiquing

IMPORTANT: Always respond with valid JSON matching this exact structure:
{
  "roast_score": <number 0-100, where 0 is terrible and 100 is perfect>,
  "headline_roast": "<A punchy 1-sentence critique that stings but is fair>",
  "key_risks": ["<risk 1>", "<risk 2>", "<risk 3>"],
  "actionable_fix": "<One specific, serious suggestion to improve the portfolio>"
}`;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Rate limiting
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const userId = extractUserId(req, supabaseClient);
    const rateLimitResult = await applyRateLimit(req, userId, "default");
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return errorResponse("AI service not configured", 500);
    }

    const body = await req.json();
    
    // Validate input
    const validationResult = portfolioAnalysisSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return errorResponse(`Invalid input: ${validationResult.error.message}`, 400);
    }

    const { holdings, total_value } = validationResult.data;

    // Calculate portfolio metrics for analysis
    const portfolioTotal = total_value || holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    
    // Build sector allocation
    const sectorAllocation: Record<string, number> = {};
    const tickerAllocation: Record<string, number> = {};
    
    holdings.forEach((h) => {
      const value = h.current_value || 0;
      const sector = h.sector || "Unknown";
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;
      tickerAllocation[h.ticker] = (tickerAllocation[h.ticker] || 0) + value;
    });

    // Calculate percentages
    const sectorPercentages = Object.entries(sectorAllocation).map(([sector, value]) => ({
      sector,
      percentage: portfolioTotal > 0 ? ((value / portfolioTotal) * 100).toFixed(1) : "0",
    }));

    const tickerPercentages = Object.entries(tickerAllocation).map(([ticker, value]) => ({
      ticker,
      percentage: portfolioTotal > 0 ? ((value / portfolioTotal) * 100).toFixed(1) : "0",
    }));

    const userPrompt = `Roast this portfolio:

HOLDINGS:
${holdings.map((h) => `- ${h.ticker}: ${h.shares} shares, $${(h.current_value || 0).toLocaleString()} value (${h.sector || 'Unknown sector'})`).join("\n")}

SECTOR ALLOCATION:
${sectorPercentages.map((s) => `- ${s.sector}: ${s.percentage}%`).join("\n")}

TOP POSITIONS BY WEIGHT:
${tickerPercentages.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage)).slice(0, 5).map((t) => `- ${t.ticker}: ${t.percentage}%`).join("\n")}

TOTAL PORTFOLIO VALUE: $${portfolioTotal.toLocaleString()}
NUMBER OF POSITIONS: ${holdings.length}

Give me your brutally honest assessment.`;

    console.log("Calling AI for portfolio analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: sanitizeString(userPrompt, 5000) },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return errorResponse("Rate limit exceeded. Please try again later.", 429);
      }
      if (response.status === 402) {
        return errorResponse("AI service quota exceeded.", 402);
      }
      return errorResponse("Failed to analyze portfolio", 500);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return errorResponse("Failed to generate analysis", 500);
    }

    // Parse the JSON response
    try {
      // Extract JSON from potential markdown code blocks
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }

      const analysis = JSON.parse(jsonContent);
      
      // Validate response structure
      if (
        typeof analysis.roast_score !== "number" ||
        typeof analysis.headline_roast !== "string" ||
        !Array.isArray(analysis.key_risks) ||
        typeof analysis.actionable_fix !== "string"
      ) {
        throw new Error("Invalid response structure");
      }

      // Ensure roast_score is within bounds
      analysis.roast_score = Math.max(0, Math.min(100, analysis.roast_score));

      return successResponse(analysis, rateLimitResult.headers);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Content:", content);
      
      // Fallback response
      return successResponse({
        roast_score: 50,
        headline_roast: "Your portfolio is... interesting. Let's just say there's room for improvement.",
        key_risks: [
          "Unable to fully analyze - please ensure your holdings have complete data",
          "Consider reviewing sector diversification",
          "Check expense ratios on any ETFs or mutual funds",
        ],
        actionable_fix: "Add more diversification across sectors and asset classes to reduce concentration risk.",
      }, rateLimitResult.headers);
    }
  } catch (error) {
    console.error("Error in analyze-portfolio:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error", 500);
  }
});
