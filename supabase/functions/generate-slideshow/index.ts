import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate Limiting
interface RateLimitEntry { count: number; resetTime: number; }
const ipRateLimits = new Map<string, RateLimitEntry>();
const IP_LIMIT = { windowMs: 60000, maxRequests: 30 };

function checkRateLimit(key: string, store: Map<string, RateLimitEntry>, config: typeof IP_LIMIT): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (store.size > 10000) { for (const [k, v] of store.entries()) { if (now > v.resetTime) store.delete(k); } }
  if (!entry || now > entry.resetTime) { store.set(key, { count: 1, resetTime: now + config.windowMs }); return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }; }
  if (entry.count >= config.maxRequests) { return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }; }
  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

const slideshowSchema = z.object({
  courseTitle: z.string().min(2, 'Course title required').max(300, 'Title too long').transform(s => s.trim()),
  courseDescription: z.string().max(1000).optional().transform(s => s?.trim())
});

serve(async (req) => {
  if (req.method === 'OPTIONS') { return new Response(null, { headers: corsHeaders }); }

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipResult = checkRateLimit(`ip:${ip}`, ipRateLimits, IP_LIMIT);
    const rateLimitHeaders = { 'X-RateLimit-Limit': String(IP_LIMIT.maxRequests), 'X-RateLimit-Remaining': String(ipResult.remaining) };

    if (!ipResult.allowed) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil(ipResult.resetIn / 1000)) } });
    }

    let body: unknown;
    try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

    const parseResult = slideshowSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: `Validation failed: ${parseResult.error.errors.map(e => e.message).join('; ')}` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { courseTitle, courseDescription } = parseResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) { throw new Error('LOVABLE_API_KEY is not configured'); }

    console.log('Generating slideshow for:', courseTitle);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert educational content creator. Generate engaging slideshow content for financial education courses.' },
          { role: 'user', content: `Create 5 educational slides for a course introduction about "${courseTitle}". ${courseDescription ? `Course description: ${courseDescription}` : ''}` }
        ],
        tools: [{ type: 'function', function: { name: 'create_slideshow', description: 'Create an educational slideshow with 5 slides', parameters: { type: 'object', properties: { slides: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, bulletPoints: { type: 'array', items: { type: 'string' } }, icon: { type: 'string', enum: ['BookOpen', 'TrendingUp', 'DollarSign', 'PieChart', 'BarChart3', 'Wallet', 'Target', 'Shield', 'Lightbulb', 'CheckCircle', 'AlertCircle', 'Info', 'Star'] } }, required: ['title', 'bulletPoints', 'icon'] } } }, required: ['slides'] } } }],
        tool_choice: { type: 'function', function: { name: 'create_slideshow' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) { return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
      if (response.status === 402) { return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    let slides = [];
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) { try { slides = JSON.parse(toolCall.function.arguments).slides || []; } catch { /* fallback */ } }

    if (!slides.length) {
      slides = [
        { title: `Welcome to ${courseTitle}`, bulletPoints: ["Learn essential concepts", "Practical examples", "Build knowledge step by step"], icon: "BookOpen" },
        { title: "Key Concepts", bulletPoints: ["Understanding fundamentals", "Break down complex ideas", "Each lesson builds on the previous"], icon: "Lightbulb" },
        { title: "What You'll Learn", bulletPoints: ["Core principles and terminology", "Practical strategies", "Common pitfalls to avoid"], icon: "Target" },
        { title: "Your Learning Journey", bulletPoints: ["Interactive lessons", "Progress tracking", "Quizzes to test understanding"], icon: "TrendingUp" },
        { title: "Let's Get Started!", bulletPoints: ["Take your time with each lesson", "Review concepts as needed", "Ready to begin?"], icon: "Star" }
      ];
    }

    return new Response(JSON.stringify({ slides }), { headers: { ...corsHeaders, ...rateLimitHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error generating slideshow:', error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
