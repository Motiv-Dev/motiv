import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// ============================================================
// RATE LIMITER — In-memory, per-IP, sliding window
// Protects against DDoS, brute force, and bill-shock attacks
// ============================================================
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Limits per route category (requests per window)
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  // Auth endpoints: 10 attempts per 15 min (brute force protection)
  "/api/auth": { max: 10, windowMs: 15 * 60 * 1000 },
  "/api/admin/login": { max: 5, windowMs: 15 * 60 * 1000 },
  // File uploads: 30 per hour (prevents R2 abuse)
  "/api/proofs": { max: 30, windowMs: 60 * 60 * 1000 },
  "/api/payments": { max: 20, windowMs: 60 * 60 * 1000 },
  // Read-heavy endpoints: 120 per minute
  "/api/stakes": { max: 120, windowMs: 60 * 1000 },
  "/api/wall-of-shame": { max: 60, windowMs: 60 * 1000 },
  "/api/leaderboard": { max: 60, windowMs: 60 * 1000 },
  "/api/groups": { max: 60, windowMs: 60 * 1000 },
  // Catch-all API: 200 per minute
  "/api": { max: 200, windowMs: 60 * 1000 },
};

// Global per-IP limit: 500 requests per minute across ALL routes
const GLOBAL_LIMIT = { max: 500, windowMs: 60 * 1000 };

// Max upload size: 5MB (photos shouldn't be bigger)
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Daily limits to prevent bill shock
const dailyCounters = new Map<string, { count: number; date: string }>();
const DAILY_UPLOAD_LIMIT = 200; // Max 200 uploads per day total (across all users)
const DAILY_DB_QUERY_LIMIT = 50000; // Safety cap

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isRateLimited(key: string, limit: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs });
    return false;
  }

  entry.count++;
  if (entry.count > limit.max) return true;
  return false;
}

function checkDailyLimit(category: string, limit: number): boolean {
  const today = new Date().toISOString().split("T")[0];
  const entry = dailyCounters.get(category);

  if (!entry || entry.date !== today) {
    dailyCounters.set(category, { count: 1, date: today });
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

// Clean up stale entries every 5 minutes to prevent memory leak
let lastCleanup = Date.now();
function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  });

  // Cap store size at 10K entries (emergency memory protection)
  if (rateLimitStore.size > 10000) {
    const entries = Array.from(rateLimitStore.entries());
    entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (let i = 0; i < entries.length - 5000; i++) {
      rateLimitStore.delete(entries[i][0]);
    }
  }
}

// Security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

// Suspicious pattern detection
function isSuspiciousRequest(req: NextRequest): string | null {
  const url = req.nextUrl.pathname + (req.nextUrl.search || "");

  // SQL injection patterns in URL
  const sqlPatterns = /('|--|;|\/\*|\*\/|union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+.*set|exec\s*\(|xp_)/i;
  if (sqlPatterns.test(url)) return "SQL injection pattern detected";

  // Path traversal
  if (url.includes("..") || url.includes("~") || url.includes("%2e%2e")) {
    return "Path traversal detected";
  }

  // Script injection in URL
  if (/<script|javascript:|on\w+\s*=|eval\s*\(/i.test(url)) {
    return "XSS pattern detected";
  }

  return null;
}

export default clerkMiddleware(async (auth, req) => {
  cleanupStaleEntries();

  const ip = getClientIp(req);
  const path = req.nextUrl.pathname;

  // 1. Block suspicious requests immediately
  const suspicion = isSuspiciousRequest(req);
  if (suspicion) {
    return NextResponse.json(
      { error: "Request blocked", reason: suspicion },
      { status: 403 }
    );
  }

  // 2. Handle CORS preflight
  if (req.method === "OPTIONS") {
    const preflightResponse = new NextResponse(null, { status: 204 });
    return addSecurityHeaders(preflightResponse);
  }

  // 3. Only rate-limit API routes
  if (path.startsWith("/api")) {
    // Global per-IP limit
    if (isRateLimited(`global:${ip}`, GLOBAL_LIMIT)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    // Route-specific limit (find most specific match)
    let matchedLimit = RATE_LIMITS["/api"];
    for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
      if (path.startsWith(prefix) && prefix.length > 4) {
        matchedLimit = limit;
        break;
      }
    }
    if (matchedLimit && isRateLimited(`route:${ip}:${path}`, matchedLimit)) {
      return NextResponse.json(
        { error: "Rate limit exceeded for this endpoint." },
        { status: 429, headers: { "Retry-After": "30" } }
      );
    }

    // 4. Upload size check (5MB max)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum upload size is 5MB." },
        { status: 413 }
      );
    }

    // 5. Daily upload limit (bill shock protection)
    if ((path === "/api/proofs" || path === "/api/payments") && req.method === "POST") {
      if (checkDailyLimit("uploads", DAILY_UPLOAD_LIMIT)) {
        return NextResponse.json(
          { error: "Daily upload limit reached. Try again tomorrow." },
          { status: 429 }
        );
      }
    }

    // 6. Daily D1 query budget (approximate — counted at middleware level)
    if (checkDailyLimit("queries", DAILY_DB_QUERY_LIMIT)) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try later." },
        { status: 503 }
      );
    }
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
