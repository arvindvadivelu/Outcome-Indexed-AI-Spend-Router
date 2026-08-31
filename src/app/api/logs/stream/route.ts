import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();
  const sampleEvents = [
    { event: "ROUTER_PULSE", latencyMs: 38, model: "DeepSeek-V3", savedUsd: 0.0032, timestamp: new Date().toISOString() },
    { event: "CACHE_HIT", latencyMs: 0.4, model: "Claude 3.5 Sonnet", savedUsd: 0.0051, timestamp: new Date().toISOString() },
    { event: "CIRCUIT_BREAKER_CHECK", status: "HEALTHY", upstream: "anthropic", timestamp: new Date().toISOString() }
  ];

  const stream = new ReadableStream({
    start(controller) {
      sampleEvents.forEach((evt) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      });
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    }
  });
}
