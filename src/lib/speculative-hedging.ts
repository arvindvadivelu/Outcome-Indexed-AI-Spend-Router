/**
 * Outcome-Indexed AI Spend Router - Speculative Upstream Request Hedging Engine
 * Production Readiness Hardening (PR-060)
 */

export interface ProviderLatencyStats {
  provider: string;
  samples: number[];
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface HedgingConfig {
  minHedgeDelayMs: number; // e.g. 150ms minimum before hedging
  p95Multiplier: number;   // e.g. 1.1x p95
  maxHedgeDelayMs: number; // e.g. 3000ms max
  enabled: boolean;
}

export interface HedgingResult {
  winner: 'PRIMARY' | 'HEDGED_SECONDARY';
  winnerProvider: string;
  loserProvider?: string;
  totalLatencyMs: number;
  hedgedTriggered: boolean;
  timeSavedMs: number;
  data: any;
}

export interface HedgingMetrics {
  totalRequests: number;
  hedgedDispatches: number;
  primaryWins: number;
  secondaryHedgeWins: number;
  cancelledRedundantCount: number;
  totalTimeSavedMs: number;
  averageLatencyMs: number;
}

export class SpeculativeHedgingOptimizer {
  private static instance: SpeculativeHedgingOptimizer;
  private readonly providerLatencies: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;
  
  private config: HedgingConfig = {
    minHedgeDelayMs: 100,
    p95Multiplier: 1.0,
    maxHedgeDelayMs: 2500,
    enabled: true,
  };

  // Metrics
  private totalRequests = 0;
  private hedgedDispatches = 0;
  private primaryWins = 0;
  private secondaryHedgeWins = 0;
  private cancelledRedundant = 0;
  private totalTimeSavedMs = 0;
  private totalLatencySumMs = 0;

  private constructor() {
    // Seed default baseline latencies
    this.recordLatency('openai', 350);
    this.recordLatency('openai', 420);
    this.recordLatency('openai', 480);
    this.recordLatency('anthropic', 380);
    this.recordLatency('anthropic', 450);
    this.recordLatency('deepseek', 280);
    this.recordLatency('deepseek', 310);
  }

  public static getInstance(): SpeculativeHedgingOptimizer {
    if (!SpeculativeHedgingOptimizer.instance) {
      SpeculativeHedgingOptimizer.instance = new SpeculativeHedgingOptimizer();
    }
    return SpeculativeHedgingOptimizer.instance;
  }

  public setConfig(config: Partial<HedgingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): HedgingConfig {
    return { ...this.config };
  }

  public recordLatency(provider: string, latencyMs: number): void {
    let samples = this.providerLatencies.get(provider);
    if (!samples) {
      samples = [];
      this.providerLatencies.set(provider, samples);
    }
    samples.push(latencyMs);
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  public getProviderStats(provider: string): ProviderLatencyStats {
    const samples = this.providerLatencies.get(provider) || [300];
    const sorted = [...samples].sort((a, b) => a - b);
    const getPercentile = (p: number) => {
      const idx = Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1);
      return sorted[idx];
    };

    return {
      provider,
      samples: [...samples],
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
    };
  }

  public calculateHedgeDelay(primaryProvider: string): number {
    const stats = this.getProviderStats(primaryProvider);
    const calculated = Math.round(stats.p95 * this.config.p95Multiplier);
    return Math.min(Math.max(calculated, this.config.minHedgeDelayMs), this.config.maxHedgeDelayMs);
  }

  /**
   * Execute request with speculative hedging against tail latency
   */
  public async executeWithHedging<T>(
    primaryProvider: string,
    secondaryProvider: string,
    primaryFn: (signal: AbortSignal) => Promise<T>,
    secondaryFn: (signal: AbortSignal) => Promise<T>,
    customHedgeDelayMs?: number
  ): Promise<HedgingResult> {
    this.totalRequests++;
    const startTime = Date.now();
    const hedgeDelay = customHedgeDelayMs ?? this.calculateHedgeDelay(primaryProvider);

    const primaryAbort = new AbortController();
    const secondaryAbort = new AbortController();

    let hedgedTriggered = false;
    let hedgeTimeoutId: NodeJS.Timeout | null = null;

    type RacePayload = {
      winner: 'PRIMARY' | 'HEDGED_SECONDARY';
      provider: string;
      data: T;
      finishTime: number;
    };

    const primaryPromise: Promise<RacePayload> = primaryFn(primaryAbort.signal)
      .then((data) => {
        const finishTime = Date.now();
        this.recordLatency(primaryProvider, finishTime - startTime);
        return { winner: 'PRIMARY' as const, provider: primaryProvider, data, finishTime };
      });

    let secondaryPromise: Promise<RacePayload> | null = null;

    const executeSecondary = (): Promise<RacePayload> => {
      hedgedTriggered = true;
      this.hedgedDispatches++;
      const secStart = Date.now();
      return secondaryFn(secondaryAbort.signal).then((data) => {
        const finishTime = Date.now();
        this.recordLatency(secondaryProvider, finishTime - secStart);
        return { winner: 'HEDGED_SECONDARY' as const, provider: secondaryProvider, data, finishTime };
      });
    };

    // If hedging is enabled, set timer for secondary speculative request
    if (this.config.enabled && secondaryProvider) {
      const hedgeWaitPromise = new Promise<RacePayload>((resolve, reject) => {
        hedgeTimeoutId = setTimeout(() => {
          secondaryPromise = executeSecondary();
          secondaryPromise.then(resolve).catch(reject);
        }, hedgeDelay);
      });

      // Race between primary completing vs hedge triggering & completing
      try {
        const raceResult = await Promise.race([primaryPromise, hedgeWaitPromise]);
        
        if (hedgeTimeoutId) clearTimeout(hedgeTimeoutId);

        const totalLatency = raceResult.finishTime - startTime;
        this.totalLatencySumMs += totalLatency;

        let timeSaved = 0;
        if (raceResult.winner === 'PRIMARY') {
          this.primaryWins++;
          if (hedgedTriggered) {
            secondaryAbort.abort();
            this.cancelledRedundant++;
          }
        } else {
          this.secondaryHedgeWins++;
          primaryAbort.abort();
          this.cancelledRedundant++;
          // Estimate tail latency time saved vs primary p99
          const p99 = this.getProviderStats(primaryProvider).p99;
          timeSaved = Math.max(0, p99 - totalLatency);
          this.totalTimeSavedMs += timeSaved;
        }

        return {
          winner: raceResult.winner,
          winnerProvider: raceResult.provider,
          loserProvider: raceResult.winner === 'PRIMARY' ? (hedgedTriggered ? secondaryProvider : undefined) : primaryProvider,
          totalLatencyMs: totalLatency,
          hedgedTriggered,
          timeSavedMs: timeSaved,
          data: raceResult.data,
        };
      } catch (err) {
        if (hedgeTimeoutId) clearTimeout(hedgeTimeoutId);
        primaryAbort.abort();
        secondaryAbort.abort();
        throw err;
      }
    } else {
      // Direct primary execution without hedging
      const res = await primaryPromise;
      const totalLatency = res.finishTime - startTime;
      this.totalLatencySumMs += totalLatency;
      this.primaryWins++;
      return {
        winner: 'PRIMARY',
        winnerProvider: primaryProvider,
        totalLatencyMs: totalLatency,
        hedgedTriggered: false,
        timeSavedMs: 0,
        data: res.data,
      };
    }
  }

  public getMetrics(): HedgingMetrics {
    return {
      totalRequests: this.totalRequests,
      hedgedDispatches: this.hedgedDispatches,
      primaryWins: this.primaryWins,
      secondaryHedgeWins: this.secondaryHedgeWins,
      cancelledRedundantCount: this.cancelledRedundant,
      totalTimeSavedMs: this.totalTimeSavedMs,
      averageLatencyMs: this.totalRequests > 0 ? Math.round(this.totalLatencySumMs / this.totalRequests) : 0,
    };
  }

  public reset(): void {
    this.totalRequests = 0;
    this.hedgedDispatches = 0;
    this.primaryWins = 0;
    this.secondaryHedgeWins = 0;
    this.cancelledRedundant = 0;
    this.totalTimeSavedMs = 0;
    this.totalLatencySumMs = 0;
  }
}
