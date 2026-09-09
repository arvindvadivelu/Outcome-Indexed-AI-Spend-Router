export type BackpressureState = "OPTIMAL" | "CONGESTED" | "SATURATED";

export interface SystemHealthMetrics {
  eventLoopLagMs: number;
  heapUsedBytes: number;
  heapTotalBytes: number;
  heapUsedPct: number;
  activeInFlightRequests: number;
  maxConcurrencyLimit: number;
  state: BackpressureState;
  sheddingRatioPct: number;
}

export class IngressBackpressureController {
  private activeRequests: number = 0;
  private maxConcurrencyLimit: number = 600;
  private simulatedLagMs: number = 8;
  private overrideState?: BackpressureState;

  public getMetrics(): SystemHealthMetrics {
    const memory = process.memoryUsage();
    const heapUsedPct = Math.round((memory.heapUsed / memory.heapTotal) * 100);
    const eventLoopLagMs = this.simulatedLagMs;

    let state: BackpressureState = "OPTIMAL";
    let sheddingRatioPct = 0;

    if (this.overrideState) {
      state = this.overrideState;
      sheddingRatioPct = state === "SATURATED" ? 85 : (state === "CONGESTED" ? 35 : 0);
    } else {
      if (eventLoopLagMs > 80 || heapUsedPct > 88 || this.activeRequests > this.maxConcurrencyLimit) {
        state = "SATURATED";
        sheddingRatioPct = 85;
      } else if (eventLoopLagMs > 40 || heapUsedPct > 78 || this.activeRequests > this.maxConcurrencyLimit * 0.7) {
        state = "CONGESTED";
        sheddingRatioPct = 35;
      }
    }

    return {
      eventLoopLagMs,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
      heapUsedPct,
      activeInFlightRequests: this.activeRequests,
      maxConcurrencyLimit: this.maxConcurrencyLimit,
      state,
      sheddingRatioPct
    };
  }

  public evaluateAcceptance(priority: "CRITICAL" | "STANDARD" | "BACKGROUND" = "STANDARD"): {
    accepted: boolean;
    state: BackpressureState;
    retryAfterSec?: number;
    metrics: SystemHealthMetrics;
    reason?: string;
  } {
    const metrics = this.getMetrics();

    if (metrics.state === "OPTIMAL") {
      this.activeRequests += 1;
      return { accepted: true, state: "OPTIMAL", metrics };
    }

    if (metrics.state === "CONGESTED") {
      if (priority === "BACKGROUND") {
        return {
          accepted: false,
          state: "CONGESTED",
          retryAfterSec: 2,
          metrics,
          reason: "INGRESS_CONGESTED: Background requests dropped during moderate traffic surge"
        };
      }
      this.activeRequests += 1;
      return { accepted: true, state: "CONGESTED", metrics };
    }

    // SATURATED: Only critical requests allowed
    if (priority === "CRITICAL") {
      this.activeRequests += 1;
      return { accepted: true, state: "SATURATED", metrics };
    }

    return {
      accepted: false,
      state: "SATURATED",
      retryAfterSec: 5,
      metrics,
      reason: "SERVER_SATURATED: Active backpressure shedding standard/background traffic"
    };
  }

  public releaseRequest(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  public setOverrideState(state?: BackpressureState): void {
    this.overrideState = state;
  }
}

export const globalIngressBackpressure = new IngressBackpressureController();
