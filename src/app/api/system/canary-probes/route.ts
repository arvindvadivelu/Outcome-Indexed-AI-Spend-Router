import { NextResponse } from "next/server";
import { globalSyntheticCanaryEngine, CANARY_TARGETS } from "@/lib/synthetic-canary-engine";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const origin = url.origin || "http://localhost:3000";

    const sweep = await globalSyntheticCanaryEngine.runSweep(origin);

    return NextResponse.json({
      success: true,
      sweep,
      targetCatalog: CANARY_TARGETS
    }, {
      headers: {
        "X-Canary-SLI": `${sweep.overallAvailabilitySli}%`,
        "X-Canary-SLO-Status": sweep.sloMet ? "MET" : "BREACHED"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute synthetic canary sweep" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const origin = url.origin || "http://localhost:3000";

    const sweep = await globalSyntheticCanaryEngine.runSweep(origin);

    return NextResponse.json({
      success: true,
      message: "Canary sweep triggered successfully",
      sweep
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Canary trigger failed" },
      { status: 500 }
    );
  }
}
