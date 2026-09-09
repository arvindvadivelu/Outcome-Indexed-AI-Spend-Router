import { NextResponse } from "next/server";
import { globalEvaluationBatcher } from "@/lib/adaptive-batcher";

export async function GET() {
  try {
    const metrics = globalEvaluationBatcher.getMetrics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics
    }, {
      headers: {
        "X-Batch-Queue-Length": metrics.queuedItems.toString(),
        "X-Batch-Total-Processed": metrics.totalItemsProcessed.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve batch metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, expectedOutcome, priority } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required prompt in request body" },
        { status: 400 }
      );
    }

    const start = performance.now();
    const result = await globalEvaluationBatcher.enqueue({
      prompt,
      expectedOutcome: expectedOutcome || "exact_match"
    }, priority || "STANDARD");

    const durationMs = Math.round(performance.now() - start);

    return NextResponse.json({
      success: true,
      batchEvaluated: true,
      durationMs,
      result,
      metrics: globalEvaluationBatcher.getMetrics()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Batch evaluation failed" },
      { status: 500 }
    );
  }
}
