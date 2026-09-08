import { NextResponse } from "next/server";
import { executeWithRetry } from "@/lib/retry-orchestrator";

export async function POST(req: Request) {
  try {
    const { failAttemptsCount } = await req.json().catch(() => ({}));
    const targetFailures = typeof failAttemptsCount === "number" ? failAttemptsCount : 2;

    let currentTry = 0;
    const execution = await executeWithRetry(
      async (attempt) => {
        currentTry++;
        if (currentTry <= targetFailures) {
          throw new Error(`Simulated upstream 503 Service Unavailable (attempt ${attempt + 1})`);
        }
        return {
          model: "DeepSeek-V3",
          status: "SUCCESS_AFTER_RETRY",
          response: "Recovered successfully with randomized jitter backoff."
        };
      },
      { maxRetries: 3, baseDelayMs: 20, maxDelayMs: 100 }
    );

    return NextResponse.json({
      success: true,
      recoveredAt: new Date().toISOString(),
      attemptsTotal: execution.attempts,
      totalBackoffMs: execution.totalBackoffMs,
      traces: execution.traces,
      data: execution.result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Retry execution failed" },
      { status: 500 }
    );
  }
}
