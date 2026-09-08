import { benchmarkCache, dryRunCache } from "./lru-cache";
import { telemetryQueue } from "./telemetry-queue";

/**
 * ⚡ Dynamic Memory GC Pressure Detector & Proactive Buffer Flusher
 * Monitors V8 heap usage and triggers proactive cache eviction and queue flushing.
 */

export interface MemoryHealthStatus {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  utilizationPct: number;
  pressureState: "OPTIMAL" | "ELEVATED" | "CRITICAL_PRESSURE";
  proactiveActionsTaken: string[];
}

export function checkAndRelieveMemoryPressure(): MemoryHealthStatus {
  const memory = process.memoryUsage ? process.memoryUsage() : { rss: 0, heapTotal: 1, heapUsed: 0, external: 0 };
  const heapUsedMb = Math.round(memory.heapUsed / (1024 * 1024));
  const heapTotalMb = Math.round(memory.heapTotal / (1024 * 1024)) || 1;
  const rssMb = Math.round(memory.rss / (1024 * 1024));
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
    utilizationPct,
    pressureState,
    proactiveActionsTaken: actions
  };
}
