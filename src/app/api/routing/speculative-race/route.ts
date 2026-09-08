import { NextResponse } from "next/server";
import { executeSpeculativeRace } from "@/lib/speculative-racer";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json().catch(() => ({}));
    const result = await executeSpeculativeRace(prompt);

    return NextResponse.json({
      success: true,
      racedAt: new Date().toISOString(),
      raceResult: result,
      message: `Speculative race won by '${result.winnerModel}' at ${result.winnerLatencyMs}ms. Slower trailing request '${result.cancelledTrailingModel}' cancelled.`
    }, {
      headers: {
        "X-Speculative-Winner": result.winnerModel,
        "X-Speculative-Speedup": `${result.speculativeAccelerationPct}%`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Speculative race failed" },
      { status: 500 }
    );
  }
}
