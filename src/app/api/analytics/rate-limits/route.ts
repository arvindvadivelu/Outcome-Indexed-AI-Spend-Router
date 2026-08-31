import { NextResponse } from "next/server";
import { distributedRateLimiter } from "@/lib/distributed-rate-limiter";
import { findUserByEmail, getAllUsers } from "@/lib/auth-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");
    const user = emailParam ? findUserByEmail(emailParam) : getAllUsers()[0];
    const email = user?.email || emailParam || "tenant@enterprise.ai";
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
