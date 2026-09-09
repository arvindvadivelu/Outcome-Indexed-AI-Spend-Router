export type QuarantineState = "HEALTHY" | "WARNING" | "QUARANTINED" | "PROBATION";

export interface ProviderQuarantineProfile {
  provider: string;
  state: QuarantineState;
  anomalyScore: number; // 0 - 100
  errorBurstCount: number;
  totalErrors: number;
  totalSuccesses: number;
  avgLatencyMs: number;
  lastStateChangeAt: number;
  quarantineReason?: string;
  trafficAllowancePct: number;
}

export class ProviderQuarantineEngine {
  private profiles: Map<string, ProviderQuarantineProfile> = new Map();

  constructor() {
    const providers = ["openai", "anthropic", "deepseek", "groq"];
    providers.forEach(p => {
      this.profiles.set(p, {
        provider: p,
        state: "HEALTHY",
        anomalyScore: 0,
        errorBurstCount: 0,
        totalErrors: 0,
        totalSuccesses: 100,
        avgLatencyMs: 140,
        lastStateChangeAt: Date.now(),
        trafficAllowancePct: 100
      });
    });
  }

  public recordEvent(params: {
    provider: string;
    success: boolean;
    latencyMs: number;
    isAnomaly?: boolean;
    errorMessage?: string;
  }): ProviderQuarantineProfile {
    let profile = this.profiles.get(params.provider);
    if (!profile) {
      profile = {
        provider: params.provider,
        state: "HEALTHY",
        anomalyScore: 0,
        errorBurstCount: 0,
        totalErrors: 0,
        totalSuccesses: 0,
        avgLatencyMs: params.latencyMs,
        lastStateChangeAt: Date.now(),
        trafficAllowancePct: 100
      };
      this.profiles.set(params.provider, profile);
    }

    // Update moving latency
    profile.avgLatencyMs = Math.round(profile.avgLatencyMs * 0.8 + params.latencyMs * 0.2);

    if (params.success && !params.isAnomaly) {
      profile.totalSuccesses += 1;
      profile.errorBurstCount = Math.max(0, profile.errorBurstCount - 1);
      profile.anomalyScore = Math.max(0, profile.anomalyScore - 5);

      if (profile.state === "PROBATION" && profile.anomalyScore <= 20) {
        profile.state = "HEALTHY";
        profile.trafficAllowancePct = 100;
        profile.lastStateChangeAt = Date.now();
        profile.quarantineReason = undefined;
      }
    } else {
      profile.totalErrors += 1;
      profile.errorBurstCount += 1;
      profile.anomalyScore = Math.min(100, profile.anomalyScore + (params.isAnomaly ? 25 : 15));

      if (profile.anomalyScore >= 75 || profile.errorBurstCount >= 4) {
        if (profile.state !== "QUARANTINED") {
          profile.state = "QUARANTINED";
          profile.trafficAllowancePct = 0;
          profile.lastStateChangeAt = Date.now();
          profile.quarantineReason = params.errorMessage || "Anomaly score threshold exceeded (3-sigma latency or error burst)";
        }
      } else if (profile.anomalyScore >= 40 && profile.state === "HEALTHY") {
        profile.state = "WARNING";
        profile.trafficAllowancePct = 60;
        profile.lastStateChangeAt = Date.now();
      }
    }

    return { ...profile };
  }

  public setProbation(provider: string): boolean {
    const profile = this.profiles.get(provider);
    if (!profile) return false;

    profile.state = "PROBATION";
    profile.trafficAllowancePct = 15;
    profile.anomalyScore = 30;
    profile.lastStateChangeAt = Date.now();
    profile.quarantineReason = "Canary probation trial underway";
    return true;
  }

  public overrideState(provider: string, state: QuarantineState, reason?: string): boolean {
    const profile = this.profiles.get(provider);
    if (!profile) return false;

    profile.state = state;
    profile.lastStateChangeAt = Date.now();
    profile.quarantineReason = reason;

    switch (state) {
      case "HEALTHY":
        profile.anomalyScore = 0;
        profile.errorBurstCount = 0;
        profile.trafficAllowancePct = 100;
        break;
      case "WARNING":
        profile.anomalyScore = 45;
        profile.trafficAllowancePct = 60;
        break;
      case "PROBATION":
        profile.anomalyScore = 30;
        profile.trafficAllowancePct = 15;
        break;
      case "QUARANTINED":
        profile.anomalyScore = 90;
        profile.trafficAllowancePct = 0;
        break;
    }

    return true;
  }

  public getAllProfiles(): Record<string, ProviderQuarantineProfile> {
    const result: Record<string, ProviderQuarantineProfile> = {};
    this.profiles.forEach((profile, key) => {
      result[key] = { ...profile };
    });
    return result;
  }
}

export const globalProviderQuarantineEngine = new ProviderQuarantineEngine();
