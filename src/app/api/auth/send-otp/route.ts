import { NextResponse } from "next/server";
import { findUserByEmail, generateEmailOtp } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: `No registered account found with email "${email}". Please sign up first.` },
        { status: 404 }
      );
    }

    const otp = generateEmailOtp(email);

    // Also sync OTP generation event to Google Sheet webhook
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          localTime: new Date().toLocaleString(),
          action: "SIGNIN_OTP_DISPATCHED",
          name: user.name,
          email: user.email,
          workspace: user.workspace,
          plan_tier: user.plan_tier,
          monthly_token_quota: user.monthly_token_quota,
          currency: user.currency,
          auth_method: "EMAIL_OTP"
        }),
        redirect: "follow",
        signal: AbortSignal.timeout(3000)
      });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `Real-time OTP code dispatched to ${email}.`,
      otp, // Provided for fast real-time UI convenience & automated testing
      email: user.email
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to dispatch OTP" },
      { status: 500 }
    );
  }
}
