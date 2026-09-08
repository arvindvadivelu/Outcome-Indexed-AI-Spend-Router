import crypto from "crypto";

/**
 * 🔒 In-Flight Idempotency Key Lock & Request Deduplicator
 * Prevents double-billing and redundant inference dispatches on concurrent duplicate requests.
 * Enforces SHA-256 payload integrity matching and automatic 15-minute TTL memory cleanup.
 */

export interface IdempotencyLockRecord {
  idempotencyKey: string;
  payloadHash: string;
  status: "IN_PROGRESS" | "COMPLETED";
  cachedResponse?: any;
  createdAt: number;
  expiresAt: number;
}

class IdempotencyLockEngine {
  private locks: Map<string, IdempotencyLockRecord> = new Map();
  private readonly DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

  constructor() {
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        this.reapExpiredLocks();
      }, 60000);
    }
  }

  private reapExpiredLocks(): void {
    const now = Date.now();
    this.locks.forEach((record, key) => {
      if (now >= record.expiresAt) {
        this.locks.delete(key);
      }
    });
  }

  private hashPayload(payload: any): string {
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload || {});
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  public acquireLock(
    idempotencyKey: string,
    payload: any,
    ttlMs: number = this.DEFAULT_TTL_MS
  ): {
    acquired: boolean;
    cachedResponse?: any;
    status: "NEW_EXECUTION" | "DUPLICATE_IN_PROGRESS" | "IDEMPOTENT_CACHE_HIT" | "PAYLOAD_MISMATCH";
    error?: string;
  } {
    this.reapExpiredLocks();
    const payloadHash = this.hashPayload(payload);
    const existing = this.locks.get(idempotencyKey);
    const now = Date.now();

    if (existing && now < existing.expiresAt) {
      // Check payload integrity
      if (existing.payloadHash !== payloadHash) {
        return {
          acquired: false,
          status: "PAYLOAD_MISMATCH",
          error: "Idempotency key was previously used with a different request payload."
        };
      }

      if (existing.status === "COMPLETED") {
        return {
          acquired: false,
          cachedResponse: existing.cachedResponse,
          status: "IDEMPOTENT_CACHE_HIT"
        };
      }

      return {
        acquired: false,
        status: "DUPLICATE_IN_PROGRESS",
        error: "A concurrent in-flight request is already processing with this idempotency key."
      };
    }

    this.locks.set(idempotencyKey, {
      idempotencyKey,
      payloadHash,
      status: "IN_PROGRESS",
      createdAt: now,
      expiresAt: now + ttlMs
    });

    return {
      acquired: true,
      status: "NEW_EXECUTION"
    };
  }

  public completeLock(idempotencyKey: string, response: any): void {
    const record = this.locks.get(idempotencyKey);
    if (record) {
      record.status = "COMPLETED";
      record.cachedResponse = response;
    }
  }

  public releaseLock(idempotencyKey: string): void {
    this.locks.delete(idempotencyKey);
  }

  public getStats(): { totalLocks: number; inProgress: number; completed: number } {
    this.reapExpiredLocks();
    let inProgress = 0;
    let completed = 0;
    this.locks.forEach((r) => {
      if (r.status === "IN_PROGRESS") inProgress++;
      else if (r.status === "COMPLETED") completed++;
    });
    return {
      totalLocks: this.locks.size,
      inProgress,
      completed
    };
  }
}

export const idempotencyEngine = new IdempotencyLockEngine();

