import { NextResponse } from "next/server";
import { latencyHistogramTracker } from "@/lib/latency-histogram";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    if (provider) {
      const stats = latencyHistogramTracker.getStatsForProvider(provider);
      return NextResponse.json({
        success: true,
        provider,
        stats
      });
    }

    const allStats = latencyHistogramTracker.getAllProviderStats();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providerPercentiles: allStats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query latency percentiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider, latencyMs } = body;

    if (!provider || typeof latencyMs !== "number") {
      return NextResponse.json(
        { success: false, error: "provider (string) and latencyMs (number) are required" },
        { status: 400 }
      );
    }

    latencyHistogramTracker.recordSample(provider, latencyMs);
    const updatedStats = latencyHistogramTracker.getStatsForProvider(provider);

    return NextResponse.json({
      success: true,
      message: `Recorded ${latencyMs}ms sample for ${provider}`,
      stats: updatedStats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record latency sample" },
      { status: 500 }
    );
  }
}
