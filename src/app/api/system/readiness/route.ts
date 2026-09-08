import { NextResponse } from "next/server";
import { validateProductionEnvironment } from "@/lib/env-validator";
import { drainManager } from "@/lib/drain-manager";

export async function GET() {
  try {
    if (drainManager.isDraining()) {
      return NextResponse.json(
        {
          success: false,
          error: "Service is draining connections for graceful shutdown",
          drainStatus: drainManager.getDrainStatus()
        },
        { status: 503 }
      );
    }

    const report = validateProductionEnvironment();
    return NextResponse.json({
      success: report.isValid,
      checkedAt: new Date().toISOString(),
      report,
      drainStatus: drainManager.getDrainStatus()
    }, {
      status: report.isValid ? 200 : 503
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Readiness probe failed" },
      { status: 500 }
    );
  }
}
