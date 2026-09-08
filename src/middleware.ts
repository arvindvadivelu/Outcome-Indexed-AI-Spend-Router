import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createChildSpan } from "@/lib/w3c-tracing";

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https: wss: http://localhost:* ws://localhost:*",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join("; ");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  // Distributed Tracing: Extract or generate W3C traceparent
  const incomingTraceparent = request.headers.get("traceparent");
  const traceCtx = createChildSpan(incomingTraceparent);

  // Cross-Origin Resource Sharing (CORS) Preflight & Headers for API routes
  if (pathname.startsWith("/api/") || pathname.startsWith("/v1/")) {
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key, X-User-Email, X-Outcome-Strategy, X-Outcome-Target-Metric, X-Outcome-SLA-Threshold-MS, traceparent, tracestate, X-Outcome-Retry-Count, Idempotency-Key, X-Idempotency-Key",
          "Access-Control-Max-Age": "86400",
          "traceparent": traceCtx.rawHeader
        }
      });
    }

    const authHeader = request.headers.get("authorization") || request.headers.get("x-api-key") || "";
    const identifier = authHeader.trim() ? `key_${authHeader.trim().slice(-12)}` : `ip_${ip}`;

    // 120 requests per minute ceiling for API routes with jitter mitigation
    const rateLimit = checkRateLimit(identifier, 120, 60000);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: {
            message: "Rate limit exceeded. Please throttle your requests.",
            type: "rate_limit_error",
            code: 429
          }
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.reset.toString(),
            "Access-Control-Allow-Origin": "*",
            "traceparent": traceCtx.rawHeader
          }
        }
      );
    }

    const response = NextResponse.next();

    // Attach rate limit and CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());
    response.headers.set("traceparent", traceCtx.rawHeader);

    // Security Hardening Headers
    response.headers.set("Content-Security-Policy", CSP_POLICY);
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  }

  const response = NextResponse.next();

  // Global Web App Security Headers
  response.headers.set("Content-Security-Policy", CSP_POLICY);
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("traceparent", traceCtx.rawHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};

