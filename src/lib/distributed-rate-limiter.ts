/**
 * ⚡ Distributed Dynamic Token Bucket Rate Limiter with Anti-Stampede Jitter
 * Implements token bucket algorithm with tier-based refill rates, burst capacities,
 * and randomized entropy jitter to prevent synchronized retry spikes.
 */

export interface TokenBucket {
  tokens: number;
  lastRefillTimestamp: number;
  capacity: number;
  refillRatePerSec: number;
  jitterOffsetSec: number;
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

  private calculateBucketJitter(identifier: string): number {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = (hash << 5) - hash + identifier.charCodeAt(i);
      hash |= 0;
    }
    const normalized = (Math.abs(hash) % 1000) / 1000;
    return Number(((normalized - 0.5) * 0.2).toFixed(3)); // ±10% jitter in seconds
  }

  public checkTokenBucket(
    identifier: string,
    planTier: string = "growth",
    cost: number = 1,
    enableJitter: boolean = true
  ): {
    allowed: boolean;
    remainingTokens: number;
    capacity: number;
    refillRate: number;
    resetSeconds: number;
    jitterAppliedSec: number;
  } {
    const config = TIER_CONFIGS[planTier.toLowerCase()] || TIER_CONFIGS.growth;
    const now = Date.now();

    let bucket = this.buckets.get(identifier);
    if (!bucket) {
      const jitterOffsetSec = enableJitter ? this.calculateBucketJitter(identifier) : 0;
      bucket = {
        tokens: config.capacity,
        lastRefillTimestamp: now,
        capacity: config.capacity,
        refillRatePerSec: config.refillRatePerSec,
        jitterOffsetSec
      };
      this.buckets.set(identifier, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsedSeconds * bucket.refillRatePerSec);
    bucket.lastRefillTimestamp = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      const baseResetSec = (bucket.capacity - bucket.tokens) / bucket.refillRatePerSec;
      const resetSec = Math.max(1, Math.ceil(baseResetSec + bucket.jitterOffsetSec));
      return {
        allowed: true,
        remainingTokens: Math.floor(bucket.tokens),
        capacity: bucket.capacity,
        refillRate: bucket.refillRatePerSec,
        resetSeconds: resetSec,
        jitterAppliedSec: bucket.jitterOffsetSec
      };
    } else {
      const neededTokens = cost - bucket.tokens;
      const baseWaitSeconds = neededTokens / bucket.refillRatePerSec;
      const waitSeconds = Math.max(1, Math.ceil(baseWaitSeconds + bucket.jitterOffsetSec));
      return {
        allowed: false,
        remainingTokens: 0,
        capacity: bucket.capacity,
        refillRate: bucket.refillRatePerSec,
        resetSeconds: waitSeconds,
        jitterAppliedSec: bucket.jitterOffsetSec
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

