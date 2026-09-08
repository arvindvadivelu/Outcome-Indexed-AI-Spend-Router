import { NextResponse } from "next/server";
import { createPaymentIntent, PAYMENT_CONFIG } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const { email, planTier, currency } = await req.json().catch(() => ({}));

    if (!email || !planTier) {
      return NextResponse.json(
        { success: false, error: "Email and planTier ('starter', 'growth', 'enterprise') are required." },
        { status: 400 }
      );
    }

    const selectedCurrency = currency === "INR" ? "INR" : "USD";
    const intent = createPaymentIntent(email, planTier, selectedCurrency);

    return NextResponse.json({
      success: true,
      createdAt: new Date().toISOString(),
      ...intent,
      planDetails: PAYMENT_CONFIG.planPricing[planTier as "starter" | "growth" | "enterprise"]
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
