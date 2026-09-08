/**
 * ⚡ High-Performance Sliding Window Rate Limiter with Stampede Jitter Mitigation
 * Provides sub-millisecond in-memory rate limiting with automatic window expiry
 * and randomized entropy jitter (±8%) to prevent synchronized retry thundering herds.
 */

interface RateLimitRecord {
  timestamps: number[];
  jitterOffsetMs: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 300000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  jitterAppliedMs: number;
}

/**
 * Calculates a deterministic pseudo-random jitter offset based on the identifier and window
 */
function calculateJitterOffset(identifier: string, windowMs: number, maxJitterFraction: number = 0.08): number {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000; // 0.0 to 0.999
  const spread = (normalized - 0.5) * 2; // -1.0 to +1.0
  return Math.round(spread * maxJitterFraction * windowMs);
}

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000,
  enableJitter: boolean = true
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record) {
    const jitterOffsetMs = enableJitter ? calculateJitterOffset(identifier, windowMs) : 0;
    record = { timestamps: [], jitterOffsetMs };
    rateLimitStore.set(identifier, record);
  }

  const effectiveWindowMs = Math.max(1000, windowMs + record.jitterOffsetMs);

  // Filter timestamps outside current rolling window
  record.timestamps = record.timestamps.filter((ts) => now - ts < effectiveWindowMs);

  const resetTime = record.timestamps.length > 0
    ? Math.ceil((record.timestamps[0] + effectiveWindowMs) / 1000)
    : Math.ceil((now + effectiveWindowMs) / 1000);

  if (record.timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime,
      jitterAppliedMs: record.jitterOffsetMs
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - record.timestamps.length),
    reset: resetTime,
    jitterAppliedMs: record.jitterOffsetMs
  };
}

export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

