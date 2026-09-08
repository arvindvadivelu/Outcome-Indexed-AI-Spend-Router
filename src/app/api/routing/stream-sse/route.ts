import { NextResponse } from "next/server";
import { simulateSseBackpressureFlow } from "@/lib/sse-backpressure";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tokensCount, bufferLimit, includeHeartbeat } = body;
    const tokens = typeof tokensCount === "number" ? tokensCount : 25;
    const limit = typeof bufferLimit === "number" ? bufferLimit : 800;
    const heartbeat = includeHeartbeat !== false;

    const { metrics, chunks } = simulateSseBackpressureFlow(tokens, limit, heartbeat);

    return NextResponse.json({
      success: true,
      streamingProtocol: "Server-Sent Events (text/event-stream)",
      metrics,
      sampleChunksPreview: chunks.slice(0, 3),
      status: "COMPLIANT_FLOW_CONTROL"
    }, {
      headers: {
        "X-SSE-Chunks-Count": metrics.totalChunksStreamed.toString(),
        "X-SSE-Backpressure-Events": metrics.backpressureEventsTriggered.toString(),
        "X-SSE-Heartbeats-Count": metrics.heartbeatsEmitted.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "SSE flow control error" },
      { status: 500 }
    );
  }
}

