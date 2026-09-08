/**
 * ⚡ Asynchronous Micro-Batch Telemetry Queue
 * Batches incoming request logs and outcome metrics in memory before asynchronous flush.
 */

export interface QueuedTelemetryEvent {
  id: string;
  timestamp: number;
  type: "inference_trace" | "outcome_feedback" | "sla_event";
  payload: any;
}

class TelemetryBatchQueue {
  private queue: QueuedTelemetryEvent[] = [];
  private batchSize: number;
  private flushIntervalMs: number;
  private timer: NodeJS.Timeout | null = null;
  private totalFlushedEvents: number = 0;

  constructor(batchSize: number = 20, flushIntervalMs: number = 2500) {
    this.batchSize = batchSize;
    this.flushIntervalMs = flushIntervalMs;
    this.startFlushTimer();
  }

  private startFlushTimer() {
    if (typeof setInterval !== "undefined") {
      this.timer = setInterval(() => {
        this.flush();
      }, this.flushIntervalMs);
    }
  }

  public enqueue(type: QueuedTelemetryEvent["type"], payload: any): string {
    const id = `qev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.queue.push({
      id,
      timestamp: Date.now(),
      type,
      payload
    });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }

    return id;
  }

  public flush(): number {
    if (this.queue.length === 0) return 0;

    const batch = [...this.queue];
    this.queue = [];
    this.totalFlushedEvents += batch.length;

    // Simulate async batch ingestion without blocking main thread
    return batch.length;
  }

  public getStats() {
    return {
      pendingQueueSize: this.queue.length,
      totalFlushedEvents: this.totalFlushedEvents,
      batchThreshold: this.batchSize,
      flushIntervalMs: this.flushIntervalMs
    };
  }
}

export const telemetryQueue = new TelemetryBatchQueue(25, 2000);
