import { NextResponse } from "next/server";
import { evaluateRouterExperiment } from "@/lib/ab-experiment-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || "sales_email";

    const experiment = evaluateRouterExperiment(domain);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      experiment
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Experiment query failed" },
      { status: 500 }
    );
  }
}
