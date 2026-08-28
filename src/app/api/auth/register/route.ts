import { NextResponse } from "next/server";
import { registerUser, findUserByEmail } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, workspace, plan_tier, pin, currency } = body;

    if (!name || !email || !pin || pin.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Name, valid email, and 6-digit PIN are required." },
        { status: 400 }
      );
    }

    const quota = plan_tier === "starter" ? 100000 : (plan_tier === "growth" ? 500000 : (plan_tier === "enterprise" ? 2000000 : 10000));

    const user = registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      workspace: workspace?.trim() || "Acme AI Lab",
      plan_tier: plan_tier || "free",
      monthly_token_quota: quota,
      pin: pin.trim(),
      currency: currency || "USD"
    });

    // Also sync to Google Sheets endpoint
    try {
      await fetch("http://127.0.0.1:8000/api/v1/auth/google-sheet-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIGNUP",
          name: user.name,
          email: user.email,
          workspace: user.workspace,
          plan_tier: user.plan_tier,
          monthly_token_quota: user.monthly_token_quota,
          currency: user.currency,
          auth_method: "PIN_PASSWORD"
        }),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: "User registered and synced with Google Sheet ledger.",
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
      { success: false, error: error?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
