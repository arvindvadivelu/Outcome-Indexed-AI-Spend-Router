import { NextResponse } from "next/server";
import { verifyPaymentReference, getUserPaymentHistory } from "@/lib/payment-gateway";
import { findUserByEmail } from "@/lib/auth-db";

export async function POST(req: Request) {
  try {
    const { transactionId, referenceCode, email, planTier, currency } = await req.json().catch(() => ({}));

    if (!referenceCode || !email) {
      return NextResponse.json(
        { success: false, error: "referenceCode (UTR or SWIFT ref) and email are required." },
        { status: 400 }
      );
    }

    const verification = verifyPaymentReference(
      transactionId || "",
      referenceCode,
      email,
      planTier,
      currency
    );

    if (verification.success) {
      // Sync the plan upgrade in-place to Google Sheets
      const updatedUser = findUserByEmail(email);
      const webhookUrl =
        process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
        "https://script.google.com/macros/s/AKfycbxXU-gpZpy7b77qstegW4Fa4LASLK4Am10qOm2o2RhOjDQPcrqt9hPhNVTf36CxKjXv/exec";

      if (webhookUrl && updatedUser) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "PLAN_UPGRADE",
              email: updatedUser.email,
              name: updatedUser.name,
              workspace: updatedUser.workspace,
              plan_tier: updatedUser.plan_tier,
              monthly_token_quota: updatedUser.monthly_token_quota,
              currency: updatedUser.currency || currency || "USD",
              timestamp: new Date().toISOString()
            }),
            signal: AbortSignal.timeout(4000)
          });
        } catch (e) {
          console.warn("Payment verify Google Sheet sync notice:", e);
        }
      }
    }

    return NextResponse.json({
      success: verification.success,
      verifiedAt: new Date().toISOString(),
      message: verification.message,
      transaction: verification.transaction
    }, {
      status: verification.success ? 200 : 400
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "email query parameter is required" }, { status: 400 });
    }

    const history = getUserPaymentHistory(email);

    return NextResponse.json({
      success: true,
      email,
      totalTransactions: history.length,
      history
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
