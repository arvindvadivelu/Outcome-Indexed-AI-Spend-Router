import { NextResponse } from "next/server";
import { distributedRateLimiter } from "@/lib/distributed-rate-limiter";
import { findUserByEmail } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "varvind2004@gmail.com";
    const user = findUserByEmail(email);
    const planTier = user?.plan_tier || "growth";

    const bucketResult = distributedRateLimiter.checkTokenBucket(`user_${email}`, planTier, 0);

    return NextResponse.json({
      success: true,
      tenant: email,
      planTier,
      rateLimits: {
        burstCapacity: bucketResult.capacity,
        refillRatePerSec: bucketResult.refillRate,
        currentAvailableTokens: bucketResult.remainingTokens,
        secondsUntilFullRefill: bucketResult.resetSeconds,
        activeEdgeBuckets: distributedRateLimiter.getAllActiveBucketsCount()
      },
      telemetry: {
        status: "COMPLIANT",
        algorithm: "Distributed Hierarchical Token Bucket"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
