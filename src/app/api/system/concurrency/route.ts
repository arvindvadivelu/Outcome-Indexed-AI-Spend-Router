import { NextResponse } from "next/server";
import { tenantConcurrencyGuard } from "@/lib/tenant-concurrency-guard";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (tenantId) {
      const inFlight = tenantConcurrencyGuard.getTenantInFlightCount(tenantId);
      return NextResponse.json({
        success: true,
        tenantId,
        inFlightCount: inFlight
      });
    }

    const activeTenants = tenantConcurrencyGuard.getAllActiveTenants();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      activeTenants,
      totalActiveTenants: Object.keys(activeTenants).length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query tenant concurrency" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, tenantId, planTier, releaseToken } = body;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 }
      );
    }

    if (action === "acquire") {
      const slot = tenantConcurrencyGuard.acquireSlot(tenantId, planTier || "growth");
      return NextResponse.json({
        success: slot.allowed,
        status: slot.allowed ? "SLOT_ACQUIRED" : "CONCURRENCY_EXCEEDED",
        activeInFlight: slot.activeInFlight,
        limit: slot.limit,
        releaseToken: slot.releaseToken
      }, { status: slot.allowed ? 200 : 429 });
    }

    if (action === "release") {
      if (!releaseToken) {
        return NextResponse.json(
          { success: false, error: "releaseToken is required for release action" },
          { status: 400 }
        );
      }
      const released = tenantConcurrencyGuard.releaseSlot(tenantId, releaseToken);
      return NextResponse.json({
        success: released,
        message: released ? "Slot released successfully" : "Invalid release token or slot already released"
      }, { status: released ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported actions: 'acquire', 'release'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Concurrency operation failed" },
      { status: 500 }
    );
  }
}
