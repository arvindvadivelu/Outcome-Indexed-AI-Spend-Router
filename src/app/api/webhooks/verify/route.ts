import { NextResponse } from "next/server";
import { verifyHmacSignature, generateHmacSignature } from "@/lib/hmac-guard";

export async function POST(req: Request) {
  try {
    const { signatureHeader, payload, secretKey } = await req.json().catch(() => ({}));

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "secretKey is required for cryptographic verification." },
        { status: 400 }
      );
    }

    const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload || {});
    const header = signatureHeader || generateHmacSignature(payloadStr, secretKey);

    const verification = verifyHmacSignature(header, payloadStr, secretKey);

    return NextResponse.json({
      success: verification.valid,
      verifiedAt: new Date().toISOString(),
      timestamp: verification.timestamp,
      toleranceDeltaMs: verification.toleranceDeltaMs,
      headerUsed: header,
      reason: verification.reason || "Cryptographic HMAC SHA-256 signature verified."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook verification failed" },
      { status: 500 }
    );
  }
}
