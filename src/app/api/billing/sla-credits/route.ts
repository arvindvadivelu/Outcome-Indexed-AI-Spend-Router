import { NextResponse } from "next/server";
import { calculateAndAwardSlaRefund } from "@/lib/sla-credit-ledger";

export async function POST(req: Request) {
  try {
    const { provider, latencyMs, ceilingMs } = await req.json().catch(() => ({}));
    const p = provider || "openai";
    const actual = typeof latencyMs === "number" ? latencyMs : 380;
    const target = typeof ceilingMs === "number" ? ceilingMs : 250;

    const credit = calculateAndAwardSlaRefund(p, actual, target);

    return NextResponse.json({
      success: true,
      message: `Automated SLA escrow refund of $${credit.refundAmountUsd} credited to tenant account balance.`,
      credit
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "SLA credit calculation failed" },
      { status: 500 }
    );
  }
}
