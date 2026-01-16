// Shared security utilities for edge functions
// Includes rate limiting, input validation, and security headers

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ============================================
// CORS Headers
// ============================================
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// Rate Limiting
// ============================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

// In-memory rate limit stores (per-function instance)
const ipRateLimits = new Map<string, RateLimitEntry>();
const userRateLimits = new Map<string, RateLimitEntry>();

// Default rate limit configs
const DEFAULT_IP_LIMIT: RateLimitConfig = { windowMs: 60000, maxRequests: 60 };      // 60 req/min per IP
const DEFAULT_USER_LIMIT: RateLimitConfig = { windowMs: 60000, maxRequests: 100 };   // 100 req/min per user
const STRICT_IP_LIMIT: RateLimitConfig = { windowMs: 60000, maxRequests: 20 };       // 20 req/min for sensitive ops
const STRICT_USER_LIMIT: RateLimitConfig = { windowMs: 60000, maxRequests: 30 };     // 30 req/min for sensitive ops

export type RateLimitLevel = 'default' | 'strict' | 'relaxed';

const RATE_LIMIT_CONFIGS: Record<RateLimitLevel, { ip: RateLimitConfig; user: RateLimitConfig }> = {
  default: { ip: DEFAULT_IP_LIMIT, user: DEFAULT_USER_LIMIT },
  strict: { ip: STRICT_IP_LIMIT, user: STRICT_USER_LIMIT },
  relaxed: { ip: { windowMs: 60000, maxRequests: 120 }, user: { windowMs: 60000, maxRequests: 200 } }
};

function checkRateLimit(
  key: string,
  store: Map<string, RateLimitEntry>,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);

  // Clean up expired entries periodically
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetTime) store.delete(k);
    }
  }

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

export interface RateLimitResult {
  allowed: boolean;
  response?: Response;
  headers: Record<string, string>;
}

export function applyRateLimit(
  req: Request,
  userId?: string | null,
  level: RateLimitLevel = 'default'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[level];
  
  // Extract IP from headers (Supabase provides these)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  // Check IP rate limit
  const ipResult = checkRateLimit(`ip:${ip}`, ipRateLimits, config.ip);
  
  // Check user rate limit if authenticated
  let userResult = { allowed: true, remaining: config.user.maxRequests, resetIn: config.user.windowMs };
  if (userId) {
    userResult = checkRateLimit(`user:${userId}`, userRateLimits, config.user);
  }

  const headers = {
    'X-RateLimit-Limit': String(config.ip.maxRequests),
    'X-RateLimit-Remaining': String(Math.min(ipResult.remaining, userResult.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(Math.min(ipResult.resetIn, userResult.resetIn) / 1000)),
  };

  if (!ipResult.allowed || !userResult.allowed) {
    const retryAfter = Math.ceil(Math.max(ipResult.resetIn, userResult.resetIn) / 1000);
    return {
      allowed: false,
      headers,
      response: new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            ...headers,
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter)
          }
        }
      )
    };
  }

  return { allowed: true, headers };
}

// ============================================
// Input Validation Schemas
// ============================================

// Common schemas
export const stringSchema = (minLen = 1, maxLen = 1000) => 
  z.string().min(minLen).max(maxLen).transform(s => s.trim());

export const tickerSchema = z.string()
  .min(1).max(10)
  .transform(s => s.trim().toUpperCase())
  .refine(s => /^[A-Z0-9.-]+$/.test(s), 'Invalid ticker format');

export const symbolsSchema = z.string()
  .max(200)
  .transform(s => s.split(',').map(sym => sym.trim().toUpperCase()).filter(Boolean).slice(0, 10))
  .refine(arr => arr.every(s => /^[A-Z0-9.-]+$/.test(s)), 'Invalid symbol format');

export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email().max(255);

// Chat schemas
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(10000)
  })).max(50).optional().default([]),
  stream: z.boolean().optional().default(false),
  searchContext: z.string().max(20000).nullable().optional(),
  persona: z.enum(['financial', 'mentor']).optional().default('financial')
});

// Course schemas
export const generateCourseSchema = z.object({
  topic: z.string().min(2).max(200).transform(s => s.trim()),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner')
});

// Lesson schemas
export const lessonContentSchema = z.object({
  lessonId: z.string().uuid(),
  generateSlides: z.boolean().optional().default(false)
});

// Slideshow schemas
export const slideshowSchema = z.object({
  courseTitle: z.string().min(2).max(300).transform(s => s.trim()),
  courseDescription: z.string().max(1000).optional()
});

// Supply chain schemas
export const supplyChainSchema = z.object({
  company: z.string()
    .min(1).max(100)
    .transform(s => s.trim())
    .refine(s => /^[a-zA-Z0-9\s.&,'-]+$/.test(s), 'Invalid characters in company name')
});

// Web search schemas
export const webSearchSchema = z.object({
  query: z.string().min(1).max(500).transform(s => s.trim()),
  searchType: z.enum(['market', 'news', 'stock', 'general']).optional().default('general')
});

// Explain term schemas
export const explainTermSchema = z.object({
  term: z.string().min(1).max(200).transform(s => s.trim()),
  definition: z.string().max(1000).optional(),
  mode: z.enum(['eli5', 'mental-model', 'book-summary', 'career-roi']).optional().default('eli5')
});

// Audio schemas
export const audioLessonSchema = z.object({
  text: z.string().min(1).max(10000).transform(s => s.trim()),
  voiceId: z.string().max(100).optional().default('JBFqnCBsd6RMkjVDRZzb')
});

// ============================================
// Input Sanitization
// ============================================
export function sanitizeString(input: string, maxLength = 10000): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')  // Remove script tags
    .replace(/<[^>]+>/g, '')                            // Remove HTML tags
    .replace(/javascript:/gi, '')                       // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '')                         // Remove event handlers
    .replace(/data:/gi, '')                             // Remove data protocol
    .replace(/vbscript:/gi, '')                         // Remove vbscript protocol
    .replace(/expression\s*\(/gi, '')                   // Remove CSS expressions
    .trim()
    .slice(0, maxLength);
}

// ============================================
// Security Response Helpers
// ============================================
export function errorResponse(
  message: string, 
  status = 400,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { ...corsHeaders, ...extraHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function successResponse(
  data: unknown,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, ...extraHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// ============================================
// Authentication Helpers
// ============================================
export function extractUserId(req: Request, supabaseClient?: { auth: { getUser: (token: string) => Promise<{ data: { user: { id: string } | null } }> } }): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  // For rate limiting, we can use a hash of the token as user identifier
  // without needing to validate it (validation happens separately)
  const token = authHeader.replace('Bearer ', '');
  
  // Simple hash for rate limiting purposes
  let hash = 0;
  for (let i = 0; i < Math.min(token.length, 50); i++) {
    hash = ((hash << 5) - hash) + token.charCodeAt(i);
    hash |= 0;
  }
  return `token:${hash}`;
}
