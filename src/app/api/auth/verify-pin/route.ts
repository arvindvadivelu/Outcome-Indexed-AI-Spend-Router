import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return NextResponse.json(
        { success: false, error: "Email and 6-digit PIN are required." },
        { status: 400 }
      );
    }

    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: `No account registered with "${email}". Please check your email or create a free account.` },
        { status: 404 }
      );
    }

    if (user.pin !== pin.trim()) {
      return NextResponse.json(
        { success: false, error: "Incorrect 6-digit security PIN. Please try again or use Email OTP / Reset PIN." },
        { status: 401 }
      );
    }

    // Record login to Google Sheets Webhook
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbyuqBubGh1SrxAspikzQj4vfatQkaSMq0KeSH0qsavVOYlVUTCvYZtafASHQrph28CfZQ/exec";
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          localTime: new Date().toLocaleString(),
          action: "SIGNIN",
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
      message: "PIN verified successfully.",
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
      { success: false, error: error?.message || "Verification failed" },
      { status: 500 }
    );
  }
}
