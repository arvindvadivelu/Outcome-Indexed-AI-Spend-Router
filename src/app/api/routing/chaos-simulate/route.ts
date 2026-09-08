import { NextResponse } from "next/server";
import { executeChaosSimulation } from "@/lib/chaos-harness";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = executeChaosSimulation(body);

    return NextResponse.json({
      success: true,
      simulatedAt: new Date().toISOString(),
      result,
      message: `Chaos injection '${result.injectedFault.faultType}' triggered on '${result.injectedFault.targetProvider}'. Circuit breaker engaged and seamlessly failed over to '${result.fallbackModelUsed}' in ${result.totalRoundtripLatencyMs}ms.`
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Chaos simulation failed" },
      { status: 500 }
    );
  }
}
