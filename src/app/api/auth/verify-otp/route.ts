import { NextResponse } from "next/server";
import { findUserByEmail, verifyEmailOtp } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and 6-digit OTP are required." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email." },
        { status: 404 }
      );
    }

    const isValid = verifyEmailOtp(email, otp);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired OTP code. Please click 'Resend OTP' to receive a new code." },
        { status: 401 }
      );
    }

    // Sync successful OTP signin
    try {
      await fetch("http://127.0.0.1:8000/api/v1/auth/google-sheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIGNIN",
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
      message: "OTP verified successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspace: user.workspace,
        plan_tier: user.plan_tier,
        monthly_token_quota: user.monthly_token_quota,
        currency: user.currency
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "OTP verification failed" },
      { status: 500 }
    );
  }
}
