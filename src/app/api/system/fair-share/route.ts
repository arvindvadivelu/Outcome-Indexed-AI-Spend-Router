import { NextResponse } from "next/server";
import { globalFairShareScheduler } from "@/lib/fair-share-scheduler";

export async function GET() {
  try {
    const result = globalFairShareScheduler.computeFairShare();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      schedule: result
    }, {
      headers: {
        "X-FairShare-AvgSatisfaction": `${result.avgSatisfactionPct}%`,
        "X-FairShare-TotalAllocated": result.totalAllocated.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to compute fair-share schedule" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, tenantId, tier, baseMinQuota, requestedDemand, totalCapacity } = body;

    if (action === "SET_DEMAND") {
      if (!tenantId || !tier || typeof requestedDemand !== "number") {
        return NextResponse.json(
          { success: false, error: "Missing tenantId, tier, or valid requestedDemand number" },
          { status: 400 }
        );
      }

      globalFairShareScheduler.setDemand({
        tenantId,
        tier,
        baseMinQuota: typeof baseMinQuota === "number" ? baseMinQuota : 0,
        requestedDemand
      });

      const updated = globalFairShareScheduler.computeFairShare();

      return NextResponse.json({
        success: true,
        action: "SET_DEMAND",
        tenantId,
        schedule: updated
      });
    }

    if (action === "SET_CAPACITY") {
      if (typeof totalCapacity !== "number") {
        return NextResponse.json(
          { success: false, error: "Missing or invalid totalCapacity number" },
          { status: 400 }
        );
      }

      globalFairShareScheduler.setTotalCapacity(totalCapacity);
      const updated = globalFairShareScheduler.computeFairShare();

      return NextResponse.json({
        success: true,
        action: "SET_CAPACITY",
        totalCapacity,
        schedule: updated
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: SET_DEMAND, SET_CAPACITY"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Fair-share schedule update failed" },
      { status: 500 }
    );
  }
}
