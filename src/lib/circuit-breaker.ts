/**
 * 🛡️ Enterprise Circuit Breaker & Provider Health State Engine
 * Prevents cascading latency failures and orchestrates graceful upstream fallback.
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number; // consecutive failures before opening circuit
  recoveryTimeMs: number;   // cool-down time before attempting half-open probe
  timeoutMs: number;        // maximum allowed wire latency
}

export interface ProviderCircuitStatus {
  provider: string;
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 4,
  recoveryTimeMs: 30000, // 30s
  timeoutMs: 5000        // 5s
};

class CircuitBreakerRegistry {
  private circuits: Map<string, ProviderCircuitStatus> = new Map();

  constructor() {
    const defaultProviders = ["anthropic", "deepseek", "groq", "openai", "bedrock"];
    for (const p of defaultProviders) {
      this.circuits.set(p, {
        provider: p,
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: null,
        lastSuccessTime: Date.now(),
        totalRequests: 0,
        totalFailures: 0
      });
    }
  }

  public getStatus(provider: string): ProviderCircuitStatus {
    let status = this.circuits.get(provider);
    if (!status) {
      status = {
        provider,
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: null,
        lastSuccessTime: Date.now(),
        totalRequests: 0,
        totalFailures: 0
      };
      this.circuits.set(provider, status);
    }

    // Check if recovery timer elapsed to transition OPEN -> HALF_OPEN
    if (status.state === "OPEN" && status.lastFailureTime) {
      if (Date.now() - status.lastFailureTime > DEFAULT_CONFIG.recoveryTimeMs) {
        status.state = "HALF_OPEN";
      }
    }

    return status;
  }

  public recordSuccess(provider: string): void {
    const status = this.getStatus(provider);
    status.totalRequests++;
    status.failureCount = 0;
    status.lastSuccessTime = Date.now();
    status.state = "CLOSED";
  }

  public recordFailure(provider: string): void {
    const status = this.getStatus(provider);
    status.totalRequests++;
    status.totalFailures++;
    status.failureCount++;
    status.lastFailureTime = Date.now();

    if (status.failureCount >= DEFAULT_CONFIG.failureThreshold) {
      status.state = "OPEN";
    }
  }

  public isAvailable(provider: string): boolean {
    const status = this.getStatus(provider);
    return status.state !== "OPEN";
  }

  public getAllStatuses(): ProviderCircuitStatus[] {
    return Array.from(this.circuits.keys()).map((p) => this.getStatus(p));
  }
}

export const circuitRegistry = new CircuitBreakerRegistry();
