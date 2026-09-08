import { NextResponse } from "next/server";
import { verifyPaymentReference, getUserPaymentHistory } from "@/lib/payment-gateway";

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
