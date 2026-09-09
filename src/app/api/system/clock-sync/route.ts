import { NextResponse } from "next/server";
import { globalClockDriftGuard } from "@/lib/clock-drift-guard";

export async function GET() {
  try {
    const trueTime = globalClockDriftGuard.getConsensusTime();
    const status = globalClockDriftGuard.getStatus();

    return NextResponse.json({
      success: true,
      timestamp: new Date(trueTime.timestampMs).toISOString(),
      trueTime,
      clockStatus: status
    }, {
      headers: {
        "X-TrueTime-Offset-Ms": trueTime.clockOffsetMs.toString(),
        "X-TrueTime-Uncertainty-Ms": trueTime.uncertaintyMs.toString(),
        "X-TrueTime-Synchronized": trueTime.synchronized ? "true" : "false"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve TrueTime consensus" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "SYNC" || !action) {
      const syncResult = globalClockDriftGuard.synchronizeWithReferences();
      const trueTime = globalClockDriftGuard.getConsensusTime();

      return NextResponse.json({
        success: true,
        action: "SYNC",
        message: "NTP reference servers resynchronized successfully",
        syncResult,
        trueTime
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported action: SYNC"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Clock synchronization failed" },
      { status: 500 }
    );
  }
}
