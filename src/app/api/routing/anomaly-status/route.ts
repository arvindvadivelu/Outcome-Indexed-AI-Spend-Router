import { NextResponse } from "next/server";
import { anomalyTripper } from "@/lib/anomaly-tripper";

export async function GET() {
  try {
    const statuses = anomalyTripper.getAllStatuses();
    const anomalies = statuses.filter((s) => s.anomalyDetected);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      activeAnomaliesCount: anomalies.length,
      systemRoutingHealth: anomalies.length === 0 ? "OPTIMAL" : "DEGRADED_FAILOVER_ENGAGED",
      providers: statuses
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch anomaly status" },
      { status: 500 }
    );
  }
}
