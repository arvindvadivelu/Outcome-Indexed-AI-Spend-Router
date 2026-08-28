import { NextResponse } from "next/server";
import { findUserByEmail, generateEmailOtp } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    // Also sync OTP generation event
    try {
      await fetch("http://127.0.0.1:8000/api/v1/auth/google-sheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIGNIN_OTP_DISPATCHED",
          name: user.name,
          email: user.email,
          workspace: user.workspace,
          plan_tier: user.plan_tier,
          monthly_token_quota: user.monthly_token_quota,
          currency: user.currency,
          auth_method: "EMAIL_OTP"
        }),
        signal: AbortSignal.timeout(2000)
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
