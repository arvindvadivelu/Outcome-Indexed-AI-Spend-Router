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

    // Dispatch directly to Google Apps Script Webhook
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          localTime: new Date().toLocaleString(),
          action: "SIGNUP",
          name: user.name,
          email: user.email,
          workspace: user.workspace,
          plan_tier: user.plan_tier,
          monthly_token_quota: user.monthly_token_quota,
          currency: user.currency,
          auth_method: "PIN_PASSWORD"
        }),
        redirect: "follow",
        signal: AbortSignal.timeout(5000)
      });
    } catch (e) {
      console.warn("Google Sheet webhook notice:", e);
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
