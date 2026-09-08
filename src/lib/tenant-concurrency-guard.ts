/**
 * 🚦 Multi-Tenant Concurrency Semaphore Guard
 * Enforces plan-tiered active in-flight request limits per tenant
 * to prevent single-tenant traffic spikes from starving cluster worker resources.
 */

export interface TenantConcurrencyConfig {
  plan: "free" | "starter" | "growth" | "enterprise";
  maxConcurrentInFlight: number;
}

const CONCURRENCY_LIMITS: Record<string, number> = {
  free: 5,
  starter: 15,
  growth: 50,
  enterprise: 200
};

interface TenantSlot {
  count: number;
  tokens: Set<string>;
}

class TenantConcurrencyGuard {
  private tenantSlots: Map<string, TenantSlot> = new Map();

  public acquireSlot(
    tenantId: string,
    planTier: string = "growth"
  ): {
    allowed: boolean;
    activeInFlight: number;
    limit: number;
    releaseToken?: string;
  } {
    const key = tenantId.toLowerCase().trim();
    const limit = CONCURRENCY_LIMITS[planTier.toLowerCase()] || CONCURRENCY_LIMITS.growth;

    let slot = this.tenantSlots.get(key);
    if (!slot) {
      slot = { count: 0, tokens: new Set() };
      this.tenantSlots.set(key, slot);
    }

    if (slot.count >= limit) {
      return {
        allowed: false,
        activeInFlight: slot.count,
        limit
      };
    }

    const releaseToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    slot.count++;
    slot.tokens.add(releaseToken);

    return {
      allowed: true,
      activeInFlight: slot.count,
      limit,
      releaseToken
    };
  }

  public releaseSlot(tenantId: string, releaseToken: string): boolean {
    const key = tenantId.toLowerCase().trim();
    const slot = this.tenantSlots.get(key);
    if (!slot || !slot.tokens.has(releaseToken)) {
      return false;
    }

    slot.tokens.delete(releaseToken);
    slot.count = Math.max(0, slot.count - 1);

    if (slot.count === 0 && slot.tokens.size === 0) {
      this.tenantSlots.delete(key);
    }

    return true;
  }

  public getTenantInFlightCount(tenantId: string): number {
    const key = tenantId.toLowerCase().trim();
    return this.tenantSlots.get(key)?.count || 0;
  }

  public getAllActiveTenants(): Record<string, number> {
    const result: Record<string, number> = {};
    this.tenantSlots.forEach((slot, tenant) => {
      result[tenant] = slot.count;
    });
    return result;
  }
}

export const tenantConcurrencyGuard = new TenantConcurrencyGuard();
