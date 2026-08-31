import { NextResponse } from "next/server";
import { calculateEnterpriseRoi } from "@/lib/roi-calculator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const report = calculateEnterpriseRoi(body);

    return NextResponse.json({
      success: true,
      calculatedAt: new Date().toISOString(),
      report
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "ROI calculation failed" },
      { status: 500 }
    );
  }
}
