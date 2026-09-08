/**
 * ⚡ Distributed Dynamic Token Bucket Rate Limiter
 * Implements token bucket algorithm with tier-based refill rates and burst capacities.
 */

export interface TokenBucket {
  tokens: number;
  lastRefillTimestamp: number;
  capacity: number;
  refillRatePerSec: number;
}

export interface TierQuotaConfig {
  plan: "free" | "starter" | "growth" | "enterprise";
  capacity: number;
  refillRatePerSec: number;
}

const TIER_CONFIGS: Record<string, TierQuotaConfig> = {
  free: { plan: "free", capacity: 30, refillRatePerSec: 0.5 },       // 30 burst, 30/min
  starter: { plan: "starter", capacity: 60, refillRatePerSec: 1.0 },   // 60 burst, 60/min
  growth: { plan: "growth", capacity: 200, refillRatePerSec: 2.0 },    // 200 burst, 120/min
  enterprise: { plan: "enterprise", capacity: 1000, refillRatePerSec: 10.0 } // 1000 burst, 600/min
};

class DistributedTokenBucketLimiter {
  private buckets: Map<string, TokenBucket> = new Map();

  public checkTokenBucket(identifier: string, planTier: string = "growth", cost: number = 1): {
    allowed: boolean;
    remainingTokens: number;
    capacity: number;
    refillRate: number;
    resetSeconds: number;
  } {
    const config = TIER_CONFIGS[planTier.toLowerCase()] || TIER_CONFIGS.growth;
    const now = Date.now();

    let bucket = this.buckets.get(identifier);
    if (!bucket) {
      bucket = {
        tokens: config.capacity,
        lastRefillTimestamp: now,
        capacity: config.capacity,
        refillRatePerSec: config.refillRatePerSec
      };
      this.buckets.set(identifier, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsedSeconds * bucket.refillRatePerSec);
    bucket.lastRefillTimestamp = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      const resetSec = Math.ceil((bucket.capacity - bucket.tokens) / bucket.refillRatePerSec);
      return {
        allowed: true,
        remainingTokens: Math.floor(bucket.tokens),
        capacity: bucket.capacity,
        refillRate: bucket.refillRatePerSec,
        resetSeconds: resetSec
      };
    } else {
      const neededTokens = cost - bucket.tokens;
      const waitSeconds = Math.ceil(neededTokens / bucket.refillRatePerSec);
      return {
        allowed: false,
        remainingTokens: 0,
        capacity: bucket.capacity,
        refillRate: bucket.refillRatePerSec,
        resetSeconds: waitSeconds
      };
    }
  }

  public getBucketStats(identifier: string) {
    const bucket = this.buckets.get(identifier);
    return bucket || null;
  }

  public getAllActiveBucketsCount(): number {
    return this.buckets.size;
  }
}

export const distributedRateLimiter = new DistributedTokenBucketLimiter();
