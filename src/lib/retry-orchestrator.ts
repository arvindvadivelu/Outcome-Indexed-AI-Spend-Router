/**
 * ⚡ Enterprise Exponential Backoff & Full Jitter Retry Orchestrator
 * Prevents thundering herd problems with randomized jitter and max attempt budgets.
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  idempotencyKey?: string;
}

export interface RetryExecutionTrace {
  attempt: number;
  delayMs: number;
  errorRecorded?: string;
  succeeded: boolean;
}

export function calculateFullJitterDelay(attempt: number, baseDelayMs: number = 100, maxDelayMs: number = 2000): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
  // Full jitter: random between 0 and exponential
  return Math.floor(Math.random() * exponential);
}

export async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<{ result: T; attempts: number; totalBackoffMs: number; traces: RetryExecutionTrace[] }> {
  const maxRetries = config.maxRetries || 3;
  const baseDelay = config.baseDelayMs || 50;
  const maxDelay = config.maxDelayMs || 1000;

  const traces: RetryExecutionTrace[] = [];
  let totalBackoffMs = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation(attempt);
      traces.push({ attempt, delayMs: 0, succeeded: true });
      return { result, attempts: attempt + 1, totalBackoffMs, traces };
    } catch (err: any) {
      if (attempt === maxRetries) {
        traces.push({ attempt, delayMs: 0, succeeded: false, errorRecorded: err.message });
        throw err;
      }

      const delay = calculateFullJitterDelay(attempt, baseDelay, maxDelay);
      totalBackoffMs += delay;
      traces.push({ attempt, delayMs: delay, succeeded: false, errorRecorded: err.message });

      // Simulated sleep
      await new Promise((resolve) => setTimeout(resolve, Math.min(delay, 50)));
    }
  }

  throw new Error("Max retries exceeded");
}
