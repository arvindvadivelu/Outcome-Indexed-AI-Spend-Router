import { NextResponse } from "next/server";
import { globalIngressBackpressure, BackpressureState } from "@/lib/ingress-backpressure";

export async function GET() {
  try {
    const metrics = globalIngressBackpressure.getMetrics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      systemHealth: metrics
    }, {
      headers: {
        "X-Backpressure-State": metrics.state,
        "X-Heap-Used-Pct": `${metrics.heapUsedPct}%`,
        "X-Event-Loop-Lag-Ms": `${metrics.eventLoopLagMs}ms`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve backpressure metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, priority, overrideState } = body;

    if (action === "EVALUATE") {
      const evaluation = globalIngressBackpressure.evaluateAcceptance(priority || "STANDARD");

      if (!evaluation.accepted) {
        return NextResponse.json({
          success: false,
          action: "EVALUATE",
          rejected: true,
          state: evaluation.state,
          retryAfterSec: evaluation.retryAfterSec,
          reason: evaluation.reason,
          metrics: evaluation.metrics
        }, {
          status: 503,
          headers: {
            "Retry-After": (evaluation.retryAfterSec || 3).toString(),
            "X-Backpressure-Shed": "true"
          }
        });
      }

      return NextResponse.json({
        success: true,
        action: "EVALUATE",
        accepted: true,
        state: evaluation.state,
        metrics: evaluation.metrics
      });
    }

    if (action === "RELEASE") {
      globalIngressBackpressure.releaseRequest();
      return NextResponse.json({
        success: true,
        action: "RELEASE",
        metrics: globalIngressBackpressure.getMetrics()
      });
    }

    if (action === "SET_OVERRIDE") {
      globalIngressBackpressure.setOverrideState(overrideState as BackpressureState | undefined);
      return NextResponse.json({
        success: true,
        action: "SET_OVERRIDE",
        overrideState,
        metrics: globalIngressBackpressure.getMetrics()
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: EVALUATE, RELEASE, SET_OVERRIDE"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Ingress backpressure operation failed" },
      { status: 500 }
    );
  }
}
