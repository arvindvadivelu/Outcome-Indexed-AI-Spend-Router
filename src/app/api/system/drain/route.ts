import { NextResponse } from "next/server";
import { drainManager } from "@/lib/drain-manager";

export async function GET() {
  try {
    const status = drainManager.getDrainStatus();
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query drain status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const gracePeriodMs = typeof body.gracePeriodMs === "number" ? body.gracePeriodMs : 10000;

    if (body.action === "reset") {
      drainManager.resetDrain();
      return NextResponse.json({
        success: true,
        message: "Drain state reset to ACTIVE",
        status: drainManager.getDrainStatus()
      });
    }

    const drainResult = await drainManager.initiateDrain(gracePeriodMs);

    return NextResponse.json({
      success: true,
      message: "Server drain completed",
      drainResult,
      status: drainManager.getDrainStatus()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Drain trigger failed" },
      { status: 500 }
    );
  }
}
