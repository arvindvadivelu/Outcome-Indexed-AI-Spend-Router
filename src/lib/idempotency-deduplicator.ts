import crypto from "crypto";

/**
 * 🔒 In-Flight Idempotency Key Lock & Request Deduplicator
 * Prevents double-billing and redundant inference dispatches on concurrent duplicate requests.
 */

export interface IdempotencyLockRecord {
  idempotencyKey: string;
  payloadHash: string;
  status: "IN_PROGRESS" | "COMPLETED";
  cachedResponse?: any;
  createdAt: number;
}

class IdempotencyLockEngine {
  private locks: Map<string, IdempotencyLockRecord> = new Map();

  public acquireLock(idempotencyKey: string, payload: any): {
    acquired: boolean;
    cachedResponse?: any;
    status: "NEW_EXECUTION" | "DUPLICATE_IN_PROGRESS" | "IDEMPOTENT_CACHE_HIT";
  } {
    const payloadHash = crypto.createHash("sha256").update(JSON.stringify(payload || {})).digest("hex");
    const existing = this.locks.get(idempotencyKey);

    if (existing) {
      if (existing.status === "COMPLETED") {
        return {
          acquired: false,
          cachedResponse: existing.cachedResponse,
          status: "IDEMPOTENT_CACHE_HIT"
        };
      }
      return {
        acquired: false,
        status: "DUPLICATE_IN_PROGRESS"
      };
    }

    this.locks.set(idempotencyKey, {
      idempotencyKey,
      payloadHash,
      status: "IN_PROGRESS",
      createdAt: Date.now()
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

  public getLocksCount(): number {
    return this.locks.size;
  }
}

export const idempotencyEngine = new IdempotencyLockEngine();
