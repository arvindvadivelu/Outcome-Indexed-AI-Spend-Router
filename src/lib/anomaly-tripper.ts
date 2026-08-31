/**
 * 🚨 Dynamic P99 Latency Anomaly Tripper & Failover Engine
 * Monitors provider latency spikes, auto-derates Pareto scores, and activates fallback routing.
 */

export interface ProviderAnomalyState {
  provider: string;
  baselineLatencyMs: number;
  currentP99LatencyMs: number;
  anomalyDetected: boolean;
  scorePenaltyMultiplier: number; // e.g. 0.6 = 40% penalty
  failoverEngaged: boolean;
  alternativeRecommended: string;
}

const PROVIDER_BASELINES: Record<string, { baseline: number; alt: string }> = {
  anthropic: { baseline: 320, alt: "deepseek" },
  openai: { baseline: 380, alt: "anthropic" },
  deepseek: { baseline: 95, alt: "groq" },
  groq: { baseline: 55, alt: "deepseek" },
  bedrock: { baseline: 280, alt: "anthropic" }
};

class LatencyAnomalyTripper {
  private currentLatencies: Map<string, number> = new Map();

  constructor() {
    this.currentLatencies.set("anthropic", 310);
    this.currentLatencies.set("openai", 390);
    this.currentLatencies.set("deepseek", 84);
    this.currentLatencies.set("groq", 48);
    this.currentLatencies.set("bedrock", 270);
  }

  public recordProviderLatency(provider: string, p99LatencyMs: number) {
    this.currentLatencies.set(provider.toLowerCase(), p99LatencyMs);
  }

  public evaluateProviderAnomaly(provider: string): ProviderAnomalyState {
    const p = provider.toLowerCase();
    const config = PROVIDER_BASELINES[p] || { baseline: 250, alt: "groq" };
    const current = this.currentLatencies.get(p) || config.baseline;

    const isAnomaly = current > config.baseline * 2.2; // >2.2x baseline triggers anomaly

    return {
      provider: p,
      baselineLatencyMs: config.baseline,
      currentP99LatencyMs: current,
      anomalyDetected: isAnomaly,
      scorePenaltyMultiplier: isAnomaly ? 0.6 : 1.0,
      failoverEngaged: isAnomaly,
      alternativeRecommended: isAnomaly ? config.alt : p
    };
  }

  public getAllStatuses(): ProviderAnomalyState[] {
    return Object.keys(PROVIDER_BASELINES).map((p) => this.evaluateProviderAnomaly(p));
  }
}

export const anomalyTripper = new LatencyAnomalyTripper();
