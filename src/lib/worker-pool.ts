/**
 * ⚡ Adaptive Worker Thread Pool & Concurrency Manager
 * Manages parallel execution of heavy asynchronous batch embeddings and benchmark sweeps.
 */

export interface QueuedWorkerJob<T = any> {
  id: string;
  taskType: "semantic_embedding" | "batch_eval" | "cache_warmup";
  priority: "high" | "normal" | "background";
  status: "queued" | "running" | "completed" | "failed";
  payload: T;
  enqueuedAt: number;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
}

class AdaptiveWorkerPool {
  private maxConcurrency: number;
  private activeWorkers: number = 0;
  private queue: QueuedWorkerJob[] = [];
  private completedHistory: QueuedWorkerJob[] = [];
  private totalJobsProcessed: number = 0;

  constructor(maxConcurrency: number = 8) {
    this.maxConcurrency = maxConcurrency;
  }

  public submitJob<T>(taskType: QueuedWorkerJob["taskType"], payload: T, priority: QueuedWorkerJob["priority"] = "normal"): QueuedWorkerJob<T> {
    const job: QueuedWorkerJob<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      taskType,
      priority,
      status: "queued",
      payload,
      enqueuedAt: Date.now()
    };

    if (priority === "high") {
      this.queue.unshift(job);
    } else {
      this.queue.push(job);
    }

    this.processNext();
    return job;
  }

  private processNext() {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;
    job.status = "running";
    job.startedAt = Date.now();

    // Fast asynchronous simulation
    setTimeout(() => {
      job.status = "completed";
      job.completedAt = Date.now();
      job.durationMs = job.completedAt - (job.startedAt || job.enqueuedAt);

      this.activeWorkers--;
      this.totalJobsProcessed++;
      this.completedHistory.push(job);
      if (this.completedHistory.length > 50) this.completedHistory.shift();

      this.processNext();
    }, 20);
  }

  public getStats() {
    return {
      maxConcurrency: this.maxConcurrency,
      activeWorkers: this.activeWorkers,
      pendingQueueSize: this.queue.length,
      totalJobsProcessed: this.totalJobsProcessed,
      recentJobs: this.completedHistory.slice(-5)
    };
  }
}

export const workerPool = new AdaptiveWorkerPool(8);
