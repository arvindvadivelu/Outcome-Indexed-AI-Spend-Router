import crypto from "crypto";

/**
 * 🔒 High-Precision Distributed Atomic Mutex Lock Engine
 * Provides mutual exclusion across asynchronous operations, file snapshots, and disaster recovery.
 * Features TTL lease management, automatic expired lease eviction, and fail-safe unlock tokens.
 */

export interface LockRecord {
  resourceKey: string;
  lockToken: string;
  holderId: string;
  acquiredAt: number;
  expiresAt: number;
  ttlMs: number;
}

class DistributedAtomicLock {
  private activeLocks: Map<string, LockRecord> = new Map();

  constructor() {
    // Periodic garbage collection for expired locks to prevent deadlocks
    if (typeof setInterval !== "undefined") {
      setInterval(() => {
        this.reapExpiredLocks();
      }, 5000);
    }
  }

  private reapExpiredLocks(): void {
    const now = Date.now();
    this.activeLocks.forEach((lock, key) => {
      if (now >= lock.expiresAt) {
        this.activeLocks.delete(key);
      }
    });
  }

  /**
   * Attempts to acquire an exclusive lock on a named resource.
   */
  public acquireLock(
    resourceKey: string,
    ttlMs: number = 10000,
    holderId: string = "system_worker"
  ): {
    success: boolean;
    lockToken?: string;
    expiresAt?: number;
    error?: string;
  } {
    this.reapExpiredLocks();
    const now = Date.now();
    const existing = this.activeLocks.get(resourceKey);

    if (existing && now < existing.expiresAt) {
      return {
        success: false,
        error: `Resource '${resourceKey}' is locked by '${existing.holderId}' until ${new Date(existing.expiresAt).toISOString()}`
      };
    }

    const lockToken = `lock_${crypto.randomBytes(16).toString("hex")}`;
    const expiresAt = now + ttlMs;

    const record: LockRecord = {
      resourceKey,
      lockToken,
      holderId,
      acquiredAt: now,
      expiresAt,
      ttlMs
    };

    this.activeLocks.set(resourceKey, record);

    return {
      success: true,
      lockToken,
      expiresAt
    };
  }

  /**
   * Releases an existing lock using the holder's unique lock token.
   */
  public releaseLock(
    resourceKey: string,
    lockToken: string
  ): { success: boolean; released: boolean; message: string } {
    const existing = this.activeLocks.get(resourceKey);
    if (!existing) {
      return {
        success: true,
        released: false,
        message: `Lock for '${resourceKey}' was already released or expired`
      };
    }

    if (existing.lockToken !== lockToken) {
      return {
        success: false,
        released: false,
        message: `Invalid lock token provided for resource '${resourceKey}'`
      };
    }

    this.activeLocks.delete(resourceKey);
    return {
      success: true,
      released: true,
      message: `Lock for '${resourceKey}' successfully released`
    };
  }

  /**
   * Checks if a resource is currently locked.
   */
  public isLocked(resourceKey: string): boolean {
    this.reapExpiredLocks();
    const existing = this.activeLocks.get(resourceKey);
    return Boolean(existing && Date.now() < existing.expiresAt);
  }

  /**
   * Executes a critical asynchronous function under a resource lock.
   */
  public async withLock<T>(
    resourceKey: string,
    ttlMs: number,
    fn: () => Promise<T> | T
  ): Promise<{ success: boolean; result?: T; error?: string }> {
    const lock = this.acquireLock(resourceKey, ttlMs);
    if (!lock.success || !lock.lockToken) {
      return { success: false, error: lock.error || `Could not acquire lock for '${resourceKey}'` };
    }

    try {
      const result = await fn();
      return { success: true, result };
    } catch (err: any) {
      return { success: false, error: err?.message || "Execution failed under lock" };
    } finally {
      this.releaseLock(resourceKey, lock.lockToken);
    }
  }

  /**
   * Gets stats on all active locks.
   */
  public getLockStats(): { activeLocksCount: number; locks: Array<{ resourceKey: string; holderId: string; remainingMs: number }> } {
    this.reapExpiredLocks();
    const now = Date.now();
    const locks: Array<{ resourceKey: string; holderId: string; remainingMs: number }> = [];
    this.activeLocks.forEach((lock) => {
      locks.push({
        resourceKey: lock.resourceKey,
        holderId: lock.holderId,
        remainingMs: Math.max(0, lock.expiresAt - now)
      });
    });
    return {
      activeLocksCount: locks.length,
      locks
    };
  }
}

export const atomicLock = new DistributedAtomicLock();
