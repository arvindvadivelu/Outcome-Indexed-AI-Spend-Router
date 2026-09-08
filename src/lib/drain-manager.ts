/**
 * 🛑 Graceful Drain & Server Lifecycle Manager
 * Tracks in-flight HTTP connections, handles SIGTERM/SIGINT signals,
 * flushes asynchronous telemetry micro-batches, and signals Kubernetes/ALB readiness probes.
 */

import { telemetryQueue } from "./telemetry-queue";

class ServerDrainManager {
  private activeInFlightRequests: number = 0;
  private draining: boolean = false;
  private drainStartedAt: number | null = null;
  private processListenersRegistered: boolean = false;

  constructor() {
    this.registerSignalHandlers();
  }

  private registerSignalHandlers() {
    if (this.processListenersRegistered) return;
    if (typeof process !== "undefined" && typeof process.on === "function") {
      const handleSignal = (signal: string) => {
        console.log(`[LifecycleManager] Received ${signal}. Initiating graceful connection drain...`);
        this.initiateDrain(10000).catch((err) => {
          console.error("[LifecycleManager] Error during drain:", err);
        });
      };

      try {
        process.on("SIGTERM", () => handleSignal("SIGTERM"));
        process.on("SIGINT", () => handleSignal("SIGINT"));
        this.processListenersRegistered = true;
      } catch {
        // Ignored in non-Node or restricted runtimes
      }
    }
  }

  public isDraining(): boolean {
    return this.draining;
  }

  public getInFlightCount(): number {
    return this.activeInFlightRequests;
  }

  public getDrainStatus() {
    return {
      isDraining: this.draining,
      inFlightRequests: this.activeInFlightRequests,
      drainStartedAt: this.drainStartedAt ? new Date(this.drainStartedAt).toISOString() : null,
      canAcceptTraffic: !this.draining,
      timestamp: new Date().toISOString()
    };
  }

  public async trackRequest<T>(fn: () => Promise<T>): Promise<T> {
    this.activeInFlightRequests++;
    try {
      return await fn();
    } finally {
      this.activeInFlightRequests = Math.max(0, this.activeInFlightRequests - 1);
    }
  }

  public async initiateDrain(gracePeriodMs: number = 10000): Promise<{ drained: boolean; inFlightCount: number }> {
    this.draining = true;
    this.drainStartedAt = Date.now();

    // Flush any pending async telemetry batches
    try {
      telemetryQueue.flush();
    } catch {
      // Ignored
    }

    const startTime = Date.now();
    while (this.activeInFlightRequests > 0 && Date.now() - startTime < gracePeriodMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      drained: this.activeInFlightRequests === 0,
      inFlightCount: this.activeInFlightRequests
    };
  }

  public resetDrain() {
    this.draining = false;
    this.drainStartedAt = null;
  }
}

export const drainManager = new ServerDrainManager();
