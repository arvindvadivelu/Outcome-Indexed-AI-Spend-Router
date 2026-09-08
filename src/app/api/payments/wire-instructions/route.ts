import { NextResponse } from "next/server";
import { PAYMENT_CONFIG } from "@/lib/payment-gateway";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      domestic: PAYMENT_CONFIG.domestic,
      international: PAYMENT_CONFIG.international,
      pricing: PAYMENT_CONFIG.planPricing
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch wire instructions" },
      { status: 500 }
    );
  }
}
