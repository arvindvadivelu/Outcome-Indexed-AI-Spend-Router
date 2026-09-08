import { benchmarkCache, dryRunCache } from "./lru-cache";
import { telemetryQueue } from "./telemetry-queue";

/**
 * ⚡ High-Resolution Memory Profiler, GC Pressure Detector & Buffer Flusher
 * Monitors V8 heap usage, external buffers, and triggers proactive or forced cache evictions.
 */

export interface MemoryHealthStatus {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  externalMb: number;
  arrayBuffersMb: number;
  utilizationPct: number;
  pressureState: "OPTIMAL" | "ELEVATED" | "CRITICAL_PRESSURE";
  proactiveActionsTaken: string[];
  v8HeapLimitMb?: number;
}

export function forcePurgeAllCachesAndQueues(): { purgedCaches: string[]; memoryBeforeMb: number; memoryAfterMb: number } {
  const memBefore = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
  benchmarkCache.clear();
  dryRunCache.clear();
  telemetryQueue.flush();

  if (typeof global !== "undefined" && (global as any).gc) {
    try {
      (global as any).gc();
    } catch (e) {
      // Ignored if not run with --expose-gc
    }
  }

  const memAfter = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

  return {
    purgedCaches: ["benchmarkCache", "dryRunCache", "telemetryQueue"],
    memoryBeforeMb: Math.round(memBefore / (1024 * 1024)),
    memoryAfterMb: Math.round(memAfter / (1024 * 1024))
  };
}

export function checkAndRelieveMemoryPressure(): MemoryHealthStatus {
  const memory = process.memoryUsage ? process.memoryUsage() : { rss: 0, heapTotal: 1, heapUsed: 0, external: 0, arrayBuffers: 0 };
  const heapUsedMb = Math.round(memory.heapUsed / (1024 * 1024));
  const heapTotalMb = Math.round(memory.heapTotal / (1024 * 1024)) || 1;
  const rssMb = Math.round(memory.rss / (1024 * 1024));
  const externalMb = Math.round((memory.external || 0) / (1024 * 1024));
  const arrayBuffersMb = Math.round((memory.arrayBuffers || 0) / (1024 * 1024));
  const utilizationPct = Math.round((memory.heapUsed / memory.heapTotal) * 100);

  const actions: string[] = [];
  let pressureState: MemoryHealthStatus["pressureState"] = "OPTIMAL";

  if (utilizationPct >= 80) {
    pressureState = "CRITICAL_PRESSURE";
    benchmarkCache.clear();
    dryRunCache.clear();
    telemetryQueue.flush();
    actions.push("Proactively cleared LRU cache entries");
    actions.push("Flushed in-memory micro-batch telemetry queue to persistent storage");
  } else if (utilizationPct >= 65) {
    pressureState = "ELEVATED";
    actions.push("Monitored active buffers without eviction");
  } else {
    pressureState = "OPTIMAL";
    actions.push("Heap pressure within optimal nominal limits");
  }

  return {
    heapUsedMb,
    heapTotalMb,
    rssMb,
    externalMb,
    arrayBuffersMb,
    utilizationPct,
    pressureState,
    proactiveActionsTaken: actions
  };
}

