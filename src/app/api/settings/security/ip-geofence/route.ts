import { NextResponse } from "next/server";
import { evaluateClientIpSecurity } from "@/lib/ip-geofence-guard";

export async function POST(req: Request) {
  try {
    const { clientIp, allowedCidrs } = await req.json().catch(() => ({}));
    const testIp = clientIp || "192.168.1.50";
    const subnets = allowedCidrs || ["192.168.1.0/24", "10.0.0.0/16"];

    const evaluation = evaluateClientIpSecurity(testIp, subnets);

    return NextResponse.json({
      success: evaluation.isAllowed,
      evaluatedAt: new Date().toISOString(),
      evaluation
    }, {
      status: evaluation.isAllowed ? 200 : (evaluation.isMaliciousProxy ? 403 : 401)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "IP geofence evaluation failed" },
      { status: 500 }
    );
  }
}
