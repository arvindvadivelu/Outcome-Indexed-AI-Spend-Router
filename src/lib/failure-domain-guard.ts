/**
 * 🌐 Autonomous Failure Domain Isolation & Multi-Region Health Engine
 * Monitors regional availability zones, detects localized transit/cloud degradation,
 * and automatically isolates unhealthy failure domains while re-weighting global ingress traffic.
 */

export interface FailureDomain {
  regionId: string;
  name: string;
  providerAz: string;
  status: "HEALTHY" | "DEGRADED" | "ISOLATED_DRAINING" | "OFFLINE";
  trafficWeightPct: number;
  consecutiveFailures: number;
  avgLatencyMs: number;
  lastProbeTimestamp: string;
  isIsolated: boolean;
}

const DEFAULT_DOMAINS: FailureDomain[] = [
  {
    regionId: "us-east-1",
    name: "US East (N. Virginia)",
    providerAz: "aws-use1-az1",
    status: "HEALTHY",
    trafficWeightPct: 40,
    consecutiveFailures: 0,
    avgLatencyMs: 24,
    lastProbeTimestamp: new Date().toISOString(),
    isIsolated: false
  },
  {
    regionId: "eu-central-1",
    name: "Europe Central (Frankfurt)",
    providerAz: "aws-euc1-az2",
    status: "HEALTHY",
    trafficWeightPct: 35,
    consecutiveFailures: 0,
    avgLatencyMs: 38,
    lastProbeTimestamp: new Date().toISOString(),
    isIsolated: false
  },
  {
    regionId: "ap-southeast-1",
    name: "Asia Pacific (Singapore)",
    providerAz: "aws-apse1-az1",
    status: "HEALTHY",
    trafficWeightPct: 25,
    consecutiveFailures: 0,
    avgLatencyMs: 62,
    lastProbeTimestamp: new Date().toISOString(),
    isIsolated: false
  }
];

class FailureDomainIsolationEngine {
  private domains: Map<string, FailureDomain> = new Map();

  constructor() {
    for (const d of DEFAULT_DOMAINS) {
      this.domains.set(d.regionId, { ...d });
    }
  }

  public getDomain(regionId: string): FailureDomain | null {
    return this.domains.get(regionId.toLowerCase().trim()) || null;
  }

  public getAllDomains(): FailureDomain[] {
    return Array.from(this.domains.values());
  }

  public updateDomainHealth(
    regionId: string,
    isHealthy: boolean,
    latencyMs: number
  ): FailureDomain | null {
    const key = regionId.toLowerCase().trim();
    const domain = this.domains.get(key);
    if (!domain) return null;

    domain.lastProbeTimestamp = new Date().toISOString();
    domain.avgLatencyMs = latencyMs;

    if (isHealthy) {
      domain.consecutiveFailures = 0;
      if (domain.status === "DEGRADED" || domain.status === "ISOLATED_DRAINING") {
        domain.status = "HEALTHY";
        domain.isIsolated = false;
        this.rebalanceTrafficWeights();
      }
    } else {
      domain.consecutiveFailures++;
      if (domain.consecutiveFailures >= 3) {
        domain.status = "ISOLATED_DRAINING";
        domain.isIsolated = true;
        this.rebalanceTrafficWeights();
      } else if (domain.consecutiveFailures >= 1) {
        domain.status = "DEGRADED";
      }
    }

    return domain;
  }

  public manuallySetIsolation(regionId: string, isolate: boolean): FailureDomain | null {
    const key = regionId.toLowerCase().trim();
    const domain = this.domains.get(key);
    if (!domain) return null;

    domain.isIsolated = isolate;
    domain.status = isolate ? "ISOLATED_DRAINING" : "HEALTHY";
    domain.lastProbeTimestamp = new Date().toISOString();
    this.rebalanceTrafficWeights();

    return domain;
  }

  private rebalanceTrafficWeights(): void {
    const activeDomains = Array.from(this.domains.values()).filter((d) => !d.isIsolated);
    if (activeDomains.length === 0) return;

    const equalWeight = Math.floor(100 / activeDomains.length);
    let remainder = 100 - equalWeight * activeDomains.length;

    this.domains.forEach((d) => {
      if (d.isIsolated) {
        d.trafficWeightPct = 0;
      } else {
        d.trafficWeightPct = equalWeight + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
      }
    });
  }

  public getOptimalHealthyRegion(): string {
    const active = Array.from(this.domains.values()).filter((d) => !d.isIsolated);
    if (active.length === 0) return "us-east-1";
    // Sort by lowest latency
    active.sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
    return active[0].regionId;
  }
}

export const failureDomainEngine = new FailureDomainIsolationEngine();
