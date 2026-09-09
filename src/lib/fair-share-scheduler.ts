export interface TenantDemand {
  tenantId: string;
  tier: "free" | "starter" | "growth" | "enterprise";
  baseMinQuota: number;
  requestedDemand: number;
}

export interface TenantAllocation {
  tenantId: string;
  tier: "free" | "starter" | "growth" | "enterprise";
  requestedDemand: number;
  allocatedTokens: number;
  guaranteedMin: number;
  satisfactionPct: number;
  throttled: boolean;
}

export interface FairShareScheduleResult {
  totalPoolCapacity: number;
  totalDemand: number;
  totalAllocated: number;
  surplusUnallocated: number;
  allocations: TenantAllocation[];
  avgSatisfactionPct: number;
  starvationPreventedCount: number;
}

const TIER_WEIGHTS: Record<string, number> = {
  free: 1,
  starter: 3,
  growth: 8,
  enterprise: 20
};

export class FairShareScheduler {
  private totalCapacity: number;
  private tenantDemands: Map<string, TenantDemand> = new Map();

  constructor(totalCapacity: number = 10_000_000) {
    this.totalCapacity = totalCapacity;

    // Default tenant baseline demands
    this.setDemand({ tenantId: "tenant_free_01", tier: "free", baseMinQuota: 50_000, requestedDemand: 250_000 });
    this.setDemand({ tenantId: "tenant_starter_01", tier: "starter", baseMinQuota: 200_000, requestedDemand: 800_000 });
    this.setDemand({ tenantId: "tenant_growth_01", tier: "growth", baseMinQuota: 1_000_000, requestedDemand: 3_500_000 });
    this.setDemand({ tenantId: "tenant_enterprise_01", tier: "enterprise", baseMinQuota: 3_000_000, requestedDemand: 8_000_000 });
  }

  public setDemand(demand: TenantDemand): void {
    this.tenantDemands.set(demand.tenantId, { ...demand });
  }

  public removeTenant(tenantId: string): boolean {
    return this.tenantDemands.delete(tenantId);
  }

  public setTotalCapacity(capacity: number): void {
    this.totalCapacity = Math.max(100_000, capacity);
  }

  public computeFairShare(): FairShareScheduleResult {
    const demands = Array.from(this.tenantDemands.values());
    const totalDemand = demands.reduce((acc, d) => acc + d.requestedDemand, 0);

    // Step 1: Allocate guaranteed minimum baselines first
    let remainingCapacity = this.totalCapacity;
    const interimAllocations = new Map<string, number>();

    demands.forEach(d => {
      const minAlloc = Math.min(d.baseMinQuota, d.requestedDemand);
      interimAllocations.set(d.tenantId, minAlloc);
      remainingCapacity -= minAlloc;
    });

    remainingCapacity = Math.max(0, remainingCapacity);

    // Step 2: Distribute remaining surplus according to weighted max-min fairness
    let activeTenants = demands.filter(d => {
      const allocated = interimAllocations.get(d.tenantId) || 0;
      return allocated < d.requestedDemand;
    });

    while (remainingCapacity > 0 && activeTenants.length > 0) {
      const totalWeight = activeTenants.reduce((acc, t) => acc + (TIER_WEIGHTS[t.tier] || 1), 0);
      let allocatedInRound = 0;
      const nextActive: TenantDemand[] = [];

      for (let i = 0; i < activeTenants.length; i++) {
        const tenant = activeTenants[i];
        const weight = TIER_WEIGHTS[tenant.tier] || 1;
        const share = Math.floor((weight / totalWeight) * remainingCapacity);
        const current = interimAllocations.get(tenant.tenantId) || 0;
        const needed = tenant.requestedDemand - current;

        const grant = Math.min(share, needed);
        interimAllocations.set(tenant.tenantId, current + grant);
        allocatedInRound += grant;

        if (current + grant < tenant.requestedDemand && grant > 0) {
          nextActive.push(tenant);
        }
      }

      remainingCapacity -= allocatedInRound;
      if (allocatedInRound === 0 || remainingCapacity <= 0) break;
      activeTenants = nextActive;
    }

    // Compile results
    const allocations: TenantAllocation[] = demands.map(d => {
      const allocatedTokens = interimAllocations.get(d.tenantId) || 0;
      const satisfactionPct = d.requestedDemand > 0
        ? Math.min(100, Math.round((allocatedTokens / d.requestedDemand) * 100))
        : 100;
      return {
        tenantId: d.tenantId,
        tier: d.tier,
        requestedDemand: d.requestedDemand,
        allocatedTokens,
        guaranteedMin: d.baseMinQuota,
        satisfactionPct,
        throttled: allocatedTokens < d.requestedDemand
      };
    });

    const totalAllocated = allocations.reduce((acc, a) => acc + a.allocatedTokens, 0);
    const avgSatisfactionPct = allocations.length > 0
      ? Math.round(allocations.reduce((acc, a) => acc + a.satisfactionPct, 0) / allocations.length)
      : 100;

    const starvationPreventedCount = allocations.filter(a => a.allocatedTokens >= a.guaranteedMin && a.allocatedTokens > 0).length;

    return {
      totalPoolCapacity: this.totalCapacity,
      totalDemand,
      totalAllocated,
      surplusUnallocated: Math.max(0, this.totalCapacity - totalAllocated),
      allocations,
      avgSatisfactionPct,
      starvationPreventedCount
    };
  }
}

export const globalFairShareScheduler = new FairShareScheduler();
