import { NextResponse } from "next/server";
import { distributedRateLimiter } from "@/lib/distributed-rate-limiter";
import { checkRateLimit, getRateLimitStoreSize } from "@/lib/rate-limiter";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier") || "demo_client_node";
    const tier = searchParams.get("tier") || "growth";

    // Test sliding window with jitter
    const slidingCheck = checkRateLimit(identifier, 100, 60000, true);

    // Test token bucket with jitter
    const tokenBucketCheck = distributedRateLimiter.checkTokenBucket(identifier, tier, 1, true);

    return NextResponse.json({
      success: true,
      identifier,
      planTier: tier,
      slidingWindow: {
        allowed: slidingCheck.success,
        limit: slidingCheck.limit,
        remaining: slidingCheck.remaining,
        resetEpoch: slidingCheck.reset,
        jitterAppliedMs: slidingCheck.jitterAppliedMs,
        activeSlidingKeys: getRateLimitStoreSize()
      },
      tokenBucket: {
        allowed: tokenBucketCheck.allowed,
        remainingTokens: tokenBucketCheck.remainingTokens,
        capacity: tokenBucketCheck.capacity,
        refillRatePerSec: tokenBucketCheck.refillRate,
        resetSeconds: tokenBucketCheck.resetSeconds,
        jitterAppliedSec: tokenBucketCheck.jitterAppliedSec,
        activeBucketCount: distributedRateLimiter.getAllActiveBucketsCount()
      },
      antiStampedeStatus: "JITTER_SMOOTHING_ACTIVE"
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Rate limit stats query failed" },
      { status: 500 }
    );
  }
}
