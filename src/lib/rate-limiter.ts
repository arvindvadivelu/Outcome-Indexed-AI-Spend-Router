/**
 * ⚡ High-Performance Sliding Window Rate Limiter
 * Provides sub-millisecond in-memory rate limiting with automatic window expiry.
 */

interface RateLimitRecord {
  timestamps: number[];
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
}

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps outside current rolling window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const resetTime = record.timestamps.length > 0 ? Math.ceil((record.timestamps[0] + windowMs) / 1000) : Math.ceil((now + windowMs) / 1000);

  if (record.timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: resetTime
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - record.timestamps.length),
    reset: resetTime
  };
}
