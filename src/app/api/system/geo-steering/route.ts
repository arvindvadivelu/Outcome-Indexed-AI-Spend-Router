import { NextResponse } from "next/server";
import { globalGeoDnsRouter } from "@/lib/geo-dns-router";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const country = url.searchParams.get("country") || req.headers.get("cf-ipcountry") || "US";
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";

    const routing = globalGeoDnsRouter.resolveBestPop(clientIp, country);
    const pops = globalGeoDnsRouter.getPops();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      clientCountry: country,
      selectedPop: routing.bestPop,
      estimatedLatencyMs: routing.estimatedLatencyMs,
      distanceKm: routing.distanceKm,
      failoverApplied: routing.failoverApplied,
      allPops: pops,
      rankings: routing.candidateRankings
    }, {
      headers: {
        "X-Anycast-POP": routing.bestPop.id,
        "X-Anycast-Latency": `${routing.estimatedLatencyMs}ms`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to resolve geo-steering routing" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, popId, healthy } = body;

    if (action === "SET_HEALTH") {
      if (!popId || typeof healthy !== "boolean") {
        return NextResponse.json(
          { success: false, error: "Missing popId or boolean healthy property" },
          { status: 400 }
        );
      }

      const updated = globalGeoDnsRouter.setPopHealth(popId, healthy);
      return NextResponse.json({
        success: updated,
        action: "SET_HEALTH",
        popId,
        healthy
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported action: SET_HEALTH"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Geo-steering operation failed" },
      { status: 500 }
    );
  }
}
