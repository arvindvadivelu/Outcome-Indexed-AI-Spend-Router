export interface CanaryTarget {
  id: string;
  name: string;
  endpoint: string;
  expectedStatus: number;
  maxLatencyMs: number;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface CanaryProbeResult {
  targetId: string;
  name: string;
  endpoint: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  httpCode: number;
  latencyMs: number;
  timestamp: string;
  errorMessage?: string;
}

export interface CanarySummary {
  timestamp: string;
  totalProbes: number;
  healthyCount: number;
  degradedCount: number;
  failedCount: number;
  overallAvailabilitySli: number;
  targetSloPct: number;
  sloMet: boolean;
  probes: CanaryProbeResult[];
}

export const CANARY_TARGETS: CanaryTarget[] = [
  { id: "health_liveness", name: "Gateway Liveness Check", endpoint: "/api/health", expectedStatus: 200, maxLatencyMs: 250, criticality: "CRITICAL" },
  { id: "readiness_probe", name: "System Readiness Probe", endpoint: "/api/system/readiness", expectedStatus: 200, maxLatencyMs: 300, criticality: "CRITICAL" },
  { id: "auth_session", name: "Auth & Tenant Session", endpoint: "/api/auth/session", expectedStatus: 200, maxLatencyMs: 400, criticality: "CRITICAL" },
  { id: "metrics_scrape", name: "Prometheus Metrics Gateway", endpoint: "/api/metrics", expectedStatus: 200, maxLatencyMs: 350, criticality: "HIGH" },
  { id: "lock_status", name: "Distributed Lock Mutex", endpoint: "/api/system/lock-status", expectedStatus: 200, maxLatencyMs: 300, criticality: "HIGH" },
  { id: "tls_audit", name: "TLS Transport Auditor", endpoint: "/api/settings/security/tls-audit", expectedStatus: 200, maxLatencyMs: 400, criticality: "MEDIUM" }
];

export class SyntheticCanaryEngine {
  private history: CanaryProbeResult[] = [];
  private maxHistoryLength: number = 100;
  private targetSloPct: number = 99.90;

  public async probeTarget(target: CanaryTarget, baseUrl: string): Promise<CanaryProbeResult> {
    const start = performance.now();
    const url = `${baseUrl}${target.endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "OutcomeRouter-SyntheticCanary/1.0",
          "X-Canary-Probe": "true"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - start);

      let status: "HEALTHY" | "DEGRADED" | "DOWN" = "HEALTHY";
      let errorMessage: string | undefined;

      if (res.status !== target.expectedStatus) {
        status = "DOWN";
        errorMessage = `Expected HTTP ${target.expectedStatus}, got ${res.status}`;
      } else if (latencyMs > target.maxLatencyMs) {
        status = "DEGRADED";
        errorMessage = `Latency ${latencyMs}ms exceeded threshold ${target.maxLatencyMs}ms`;
      }

      const result: CanaryProbeResult = {
        targetId: target.id,
        name: target.name,
        endpoint: target.endpoint,
        status,
        httpCode: res.status,
        latencyMs,
        timestamp: new Date().toISOString(),
        errorMessage
      };

      this.recordResult(result);
      return result;
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      const result: CanaryProbeResult = {
        targetId: target.id,
        name: target.name,
        endpoint: target.endpoint,
        status: "DOWN",
        httpCode: 0,
        latencyMs,
        timestamp: new Date().toISOString(),
        errorMessage: err?.name === "AbortError" ? "Probe Timed Out (4000ms)" : (err?.message || "Connection refused")
      };

      this.recordResult(result);
      return result;
    }
  }

  private recordResult(result: CanaryProbeResult): void {
    this.history.push(result);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  public async runSweep(baseUrl: string): Promise<CanarySummary> {
    const probePromises = CANARY_TARGETS.map(target => this.probeTarget(target, baseUrl));
    const probes = await Promise.all(probePromises);

    const healthyCount = probes.filter(p => p.status === "HEALTHY").length;
    const degradedCount = probes.filter(p => p.status === "DEGRADED").length;
    const failedCount = probes.filter(p => p.status === "DOWN").length;

    const successfulCount = probes.filter(p => p.status !== "DOWN").length;
    const overallAvailabilitySli = Number(((successfulCount / probes.length) * 100).toFixed(2));

    return {
      timestamp: new Date().toISOString(),
      totalProbes: probes.length,
      healthyCount,
      degradedCount,
      failedCount,
      overallAvailabilitySli,
      targetSloPct: this.targetSloPct,
      sloMet: overallAvailabilitySli >= this.targetSloPct,
      probes
    };
  }

  public getHistory(): CanaryProbeResult[] {
    return [...this.history];
  }
}

export const globalSyntheticCanaryEngine = new SyntheticCanaryEngine();
