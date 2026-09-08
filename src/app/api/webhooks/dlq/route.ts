import { NextResponse } from "next/server";
import { webhookDlq } from "@/lib/webhook-dlq";

export async function GET() {
  try {
    const stats = webhookDlq.getStats();
    const events = webhookDlq.getEvents();

    return NextResponse.json({
      success: true,
      stats,
      events
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve DLQ status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, eventId } = body;

    if (action === "clear") {
      webhookDlq.clear();
      return NextResponse.json({
        success: true,
        message: "DLQ successfully cleared",
        stats: webhookDlq.getStats()
      });
    }

    if (action === "replay" && eventId) {
      const replayResult = await webhookDlq.replayEvent(eventId);
      return NextResponse.json({
        success: replayResult.success,
        httpStatus: replayResult.status,
        event: replayResult.event,
        stats: webhookDlq.getStats()
      }, {
        status: replayResult.success ? 200 : 502
      });
    }

    if (action === "replay_all") {
      const pendingEvents = webhookDlq.getEvents().filter((e) => e.status === "PENDING_RETRY");
      const results = [];

      for (const ev of pendingEvents) {
        const res = await webhookDlq.replayEvent(ev.id);
        results.push({ id: ev.id, success: res.success, status: res.status });
      }

      return NextResponse.json({
        success: true,
        replayedCount: results.length,
        results,
        stats: webhookDlq.getStats()
      });
    }

    // Default test enqueue
    const testItem = webhookDlq.enqueueFailure(
      body.endpointUrl || "https://api.internal-client.ai/webhooks",
      body.eventType || "outcome.feedback.sla",
      { test: true, timestamp: Date.now() },
      "t=1700000000,v1=sha256:test",
      504,
      "Gateway Gateway Timeout"
    );

    return NextResponse.json({
      success: true,
      message: "Test failure enqueued to DLQ",
      item: testItem,
      stats: webhookDlq.getStats()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "DLQ operation failed" },
      { status: 500 }
    );
  }
}
