import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/auth-db";

export async function GET() {
  const encoder = new TextEncoder();
  const allUsers = getAllUsers();
  const allLogs = allUsers.flatMap((u) => u.logs || []);

  const streamEvents = allLogs.slice(0, 10).map((log) => ({
    event: "ROUTER_DISPATCH",
    id: log.id,
    model: log.model_used,
    provider: log.provider,
    latencyMs: log.latency_ms,
    costUsd: log.cost_usd,
    task: log.task_type,
    outcome: log.outcome_success ? "WIN" : "NEUTRAL",
    timestamp: log.created_at || new Date().toISOString()
  }));

  // If no logs yet, emit live heartbeat
  if (streamEvents.length === 0) {
    streamEvents.push({
      event: "GATEWAY_HEALTH_BEAT",
      id: "oir_heartbeat",
      model: "Outcome-Indexed AI Spend Router",
      provider: "gateway",
      latencyMs: 12,
      costUsd: 0,
      task: "health_check",
      outcome: "HEALTHY",
      timestamp: new Date().toISOString()
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      streamEvents.forEach((evt) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      });
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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
