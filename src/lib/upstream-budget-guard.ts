import crypto from "crypto";

export interface ProviderBudgetConfig {
  provider: string;
  maxTpm: number;
  maxRpm: number;
}

export interface BudgetLease {
  leaseId: string;
  provider: string;
  reservedTokens: number;
  createdAt: number;
  expiresAt: number;
  committed: boolean;
  actualTokens?: number;
}

export interface ProviderUsageState {
  currentMinute: number;
  tokensConsumed: number;
  requestsConsumed: number;
  activeReservedTokens: number;
  recentLeases: BudgetLease[];
}

const DEFAULT_PROVIDER_LIMITS: Record<string, ProviderBudgetConfig> = {
  openai: { provider: "openai", maxTpm: 2_000_000, maxRpm: 10_000 },
  anthropic: { provider: "anthropic", maxTpm: 800_000, maxRpm: 4_000 },
  deepseek: { provider: "deepseek", maxTpm: 1_500_000, maxRpm: 8_000 },
  groq: { provider: "groq", maxTpm: 500_000, maxRpm: 3_000 }
};

export class UpstreamBudgetGuard {
  private configs: Map<string, ProviderBudgetConfig> = new Map();
  private usage: Map<string, ProviderUsageState> = new Map();
  private leases: Map<string, BudgetLease> = new Map();

  constructor() {
    for (const [provider, config] of Object.entries(DEFAULT_PROVIDER_LIMITS)) {
      this.configs.set(provider, config);
    }
  }

  private getCurrentMinuteWindow(): number {
    return Math.floor(Date.now() / 60000);
  }

  private getOrInitUsage(provider: string): ProviderUsageState {
    const currentMinute = this.getCurrentMinuteWindow();
    let state = this.usage.get(provider);

    if (!state || state.currentMinute !== currentMinute) {
      state = {
        currentMinute,
        tokensConsumed: 0,
        requestsConsumed: 0,
        activeReservedTokens: 0,
        recentLeases: []
      };
      this.usage.set(provider, state);
    }

    // Clean expired leases
    const now = Date.now();
    this.leases.forEach((lease, id) => {
      if (!lease.committed && lease.expiresAt <= now && lease.provider === provider) {
        state!.activeReservedTokens = Math.max(0, state!.activeReservedTokens - lease.reservedTokens);
        this.leases.delete(id);
      }
    });

    return state;
  }

  public reserveBudget(provider: string, estimatedTokens: number, leaseDurationMs: number = 30000): {
    granted: boolean;
    leaseId?: string;
    reason?: string;
    tpmRemaining: number;
    rpmRemaining: number;
    utilizationPct: number;
  } {
    const config = this.configs.get(provider) || {
      provider,
      maxTpm: 1_000_000,
      maxRpm: 5_000
    };

    const usage = this.getOrInitUsage(provider);
    const totalCommittedAndReserved = usage.tokensConsumed + usage.activeReservedTokens + estimatedTokens;
    const totalRequests = usage.requestsConsumed + 1;

    if (totalCommittedAndReserved > config.maxTpm) {
      return {
        granted: false,
        reason: `TPM_LIMIT_EXCEEDED: Requested ${estimatedTokens} tokens exceeds capacity (${totalCommittedAndReserved}/${config.maxTpm})`,
        tpmRemaining: Math.max(0, config.maxTpm - (usage.tokensConsumed + usage.activeReservedTokens)),
        rpmRemaining: Math.max(0, config.maxRpm - usage.requestsConsumed),
        utilizationPct: Math.round(((usage.tokensConsumed + usage.activeReservedTokens) / config.maxTpm) * 100)
      };
    }

    if (totalRequests > config.maxRpm) {
      return {
        granted: false,
        reason: `RPM_LIMIT_EXCEEDED: Requests (${totalRequests}/${config.maxRpm})`,
        tpmRemaining: Math.max(0, config.maxTpm - (usage.tokensConsumed + usage.activeReservedTokens)),
        rpmRemaining: 0,
        utilizationPct: Math.round((usage.requestsConsumed / config.maxRpm) * 100)
      };
    }

    const leaseId = `lease_${provider}_${crypto.randomBytes(4).toString("hex")}`;
    const lease: BudgetLease = {
      leaseId,
      provider,
      reservedTokens: estimatedTokens,
      createdAt: Date.now(),
      expiresAt: Date.now() + leaseDurationMs,
      committed: false
    };

    this.leases.set(leaseId, lease);
    usage.activeReservedTokens += estimatedTokens;
    usage.requestsConsumed += 1;

    const tpmRemaining = Math.max(0, config.maxTpm - (usage.tokensConsumed + usage.activeReservedTokens));
    const rpmRemaining = Math.max(0, config.maxRpm - usage.requestsConsumed);
    const utilizationPct = Math.round(((usage.tokensConsumed + usage.activeReservedTokens) / config.maxTpm) * 100);

    return {
      granted: true,
      leaseId,
      tpmRemaining,
      rpmRemaining,
      utilizationPct
    };
  }

  public commitLease(leaseId: string, actualTokens: number): { success: boolean; variance: number } {
    const lease = this.leases.get(leaseId);
    if (!lease || lease.committed) {
      return { success: false, variance: 0 };
    }

    const usage = this.getOrInitUsage(lease.provider);
    usage.activeReservedTokens = Math.max(0, usage.activeReservedTokens - lease.reservedTokens);
    usage.tokensConsumed += actualTokens;

    lease.committed = true;
    lease.actualTokens = actualTokens;

    const variance = actualTokens - lease.reservedTokens;
    return { success: true, variance };
  }

  public releaseLease(leaseId: string): { success: boolean; releasedTokens: number } {
    const lease = this.leases.get(leaseId);
    if (!lease || lease.committed) {
      return { success: false, releasedTokens: 0 };
    }

    const usage = this.getOrInitUsage(lease.provider);
    usage.activeReservedTokens = Math.max(0, usage.activeReservedTokens - lease.reservedTokens);
    usage.requestsConsumed = Math.max(0, usage.requestsConsumed - 1);

    this.leases.delete(leaseId);
    return { success: true, releasedTokens: lease.reservedTokens };
  }

  public getStatus(): Record<string, {
    maxTpm: number;
    maxRpm: number;
    tokensConsumed: number;
    activeReservedTokens: number;
    requestsConsumed: number;
    tpmRemaining: number;
    rpmRemaining: number;
    utilizationPct: number;
  }> {
    const result: Record<string, any> = {};

    this.configs.forEach((config, provider) => {
      const usage = this.getOrInitUsage(provider);
      const totalTokens = usage.tokensConsumed + usage.activeReservedTokens;
      result[provider] = {
        maxTpm: config.maxTpm,
        maxRpm: config.maxRpm,
        tokensConsumed: usage.tokensConsumed,
        activeReservedTokens: usage.activeReservedTokens,
        requestsConsumed: usage.requestsConsumed,
        tpmRemaining: Math.max(0, config.maxTpm - totalTokens),
        rpmRemaining: Math.max(0, config.maxRpm - usage.requestsConsumed),
        utilizationPct: Math.round((totalTokens / config.maxTpm) * 100)
      };
    });

    return result;
  }
}

export const globalUpstreamBudgetGuard = new UpstreamBudgetGuard();
