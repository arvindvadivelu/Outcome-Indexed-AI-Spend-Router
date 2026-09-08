/**
 * 📊 High-Precision Latency Histogram & Sliding-Window Percentile Engine
 * Calculates exact p50, p90, p95, p99 latency percentiles and jitter for model providers.
 */

export interface LatencyPercentileStats {
  provider: string;
  sampleCount: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
  jitterMs: number;
  lastUpdated: string;
}

class LatencyHistogramTracker {
  private samples: Map<string, number[]> = new Map();
  private maxSamples: number = 500;

  constructor() {
    // Seed standard baseline samples
    this.recordSample("openai", 220);
    this.recordSample("openai", 240);
    this.recordSample("openai", 280);
    this.recordSample("anthropic", 195);
    this.recordSample("anthropic", 210);
    this.recordSample("anthropic", 250);
    this.recordSample("deepseek", 65);
    this.recordSample("deepseek", 78);
    this.recordSample("deepseek", 110);
    this.recordSample("groq", 35);
    this.recordSample("groq", 42);
    this.recordSample("groq", 55);
  }

  public recordSample(provider: string, latencyMs: number): void {
    const key = provider.toLowerCase().trim();
    let list = this.samples.get(key);
    if (!list) {
      list = [];
      this.samples.set(key, list);
    }
    list.push(Math.max(1, latencyMs));
    if (list.length > this.maxSamples) {
      list.shift(); // Bound memory
    }
  }

  private calculatePercentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(sorted.length - 1, index))];
  }

  public getStatsForProvider(provider: string): LatencyPercentileStats {
    const key = provider.toLowerCase().trim();
    const list = this.samples.get(key) || [100];
    const sorted = [...list].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const avg = parseFloat((sum / sorted.length).toFixed(2));

    // Calculate jitter as standard deviation
    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / sorted.length;
    const jitterMs = parseFloat(Math.sqrt(variance).toFixed(2));

    return {
      provider: key,
      sampleCount: sorted.length,
      p50: this.calculatePercentile(sorted, 50),
      p90: this.calculatePercentile(sorted, 90),
      p95: this.calculatePercentile(sorted, 95),
      p99: this.calculatePercentile(sorted, 99),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg,
      jitterMs,
      lastUpdated: new Date().toISOString()
    };
  }

  public getAllProviderStats(): Record<string, LatencyPercentileStats> {
    const result: Record<string, LatencyPercentileStats> = {};
    const providers = ["openai", "anthropic", "deepseek", "groq"];
    for (const p of providers) {
      result[p] = this.getStatsForProvider(p);
    }
    return result;
  }
}

export const latencyHistogramTracker = new LatencyHistogramTracker();
