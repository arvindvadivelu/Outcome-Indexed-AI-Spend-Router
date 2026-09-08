import { NextResponse } from "next/server";
import { findUserByEmail, verifyEmailOtp, deleteUser } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and 6-digit OTP are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Live Google Sheet Verification: If row was deleted in Google Sheet, block login
    const webhookUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";

    try {
      const sheetRes = await fetch(webhookUrl, {
        signal: AbortSignal.timeout(2500),
        redirect: "follow"
      });
      if (sheetRes.ok) {
        const sheetData = await sheetRes.json();
        if (sheetData.status === "success" && Array.isArray(sheetData.emails)) {
          const sheetEmails = sheetData.emails.map((e: string) => e.trim().toLowerCase());
          if (!sheetEmails.includes(normalizedEmail)) {
            // User was removed from Google Sheet directory! Purge locally & deny access
            deleteUser(normalizedEmail);
            return NextResponse.json(
              {
                success: false,
                error: `Account for "${email}" has been deleted from the Google Sheet directory. Login is disabled.`
              },
              { status: 403 }
            );
          }
        }
      }
    } catch (e) {
      // Fallback to local DB if sheet check timed out
    }

    const user = findUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email." },
        { status: 404 }
      );
    }

    const isValid = verifyEmailOtp(normalizedEmail, otp);

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
        workspace: user.workspace || `${user.name}'s Workspace`,
        plan_tier: user.plan_tier,
        monthly_token_quota: user.monthly_token_quota,
        tokens_used: tokensUsed,
        monthlySpendUSD: actualSpend,
        baselineSpendUSD: baselineSpend,
        currency: user.currency || "USD",
        monthlyBudgetUSD: user.monthlyBudgetUSD,
        autopilotMode: user.autopilotMode,
        hasConfiguredBudget: user.hasConfiguredBudget ?? (user.monthlyBudgetUSD !== undefined && user.monthlyBudgetUSD > 0),
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
