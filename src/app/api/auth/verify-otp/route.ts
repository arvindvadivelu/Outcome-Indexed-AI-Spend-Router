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

    const tokensUsed = user.tokens_used ?? 0;
    const baselineSpend = user.baselineSpendUSD ?? Number(((tokensUsed / 1000) * 0.0052).toFixed(2));
    const actualSpend = user.monthlySpendUSD ?? Number(((tokensUsed / 1000) * 0.00065).toFixed(2));

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspace: user.workspace || "Arvind's Workspace",
        plan_tier: user.plan_tier,
        monthly_token_quota: user.monthly_token_quota,
        tokens_used: tokensUsed,
        monthlySpendUSD: actualSpend,
        baselineSpendUSD: baselineSpend,
        currency: user.currency || "INR",
        rules: user.rules || [],
        apiKeys: user.apiKeys || [],
        logs: user.logs || [],
        slaEscrowContracts: user.slaEscrowContracts || []
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "OTP verification failed" },
      { status: 500 }
    );
  }
}
