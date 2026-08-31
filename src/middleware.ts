import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  // Rate Limiting for API routes
  if (pathname.startsWith("/api/") || pathname.startsWith("/v1/")) {
    const authHeader = request.headers.get("authorization") || request.headers.get("x-api-key") || "";
    const identifier = authHeader.trim() ? `key_${authHeader.trim().slice(-12)}` : `ip_${ip}`;

    // 120 requests per minute ceiling for API routes
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
            "X-RateLimit-Reset": rateLimit.reset.toString()
          }
        }
      );
    }

    const response = NextResponse.next();

    // Attach rate limit headers
    response.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
    response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
    response.headers.set("X-RateLimit-Reset", rateLimit.reset.toString());

    // Security Hardening Headers
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
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");

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
