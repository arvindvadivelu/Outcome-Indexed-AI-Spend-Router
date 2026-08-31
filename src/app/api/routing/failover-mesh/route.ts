import { NextResponse } from "next/server";
import { failoverMeshEngine } from "@/lib/provider-failover-mesh";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      meshNodes: failoverMeshEngine.getMeshStatus()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Mesh query failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { provider } = await req.json().catch(() => ({}));
    const targetProvider = provider || "anthropic";

    const result = failoverMeshEngine.simulateProviderRateLimit(targetProvider);

    return NextResponse.json({
      success: true,
      simulatedAt: new Date().toISOString(),
      result,
      message: `Upstream 429 rate limit injected on '${result.trippedProvider}'. Hot-standby instantly took over traffic routing to '${result.failoverDivertedTo}'.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failover simulation failed" },
      { status: 500 }
    );
  }
}
