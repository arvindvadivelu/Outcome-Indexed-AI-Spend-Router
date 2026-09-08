import { NextResponse } from "next/server";
import { verifyHmacSignature, generateHmacSignature } from "@/lib/hmac-guard";

export async function POST(req: Request) {
  try {
    const { signatureHeader, payload, secretKey, rotatedSecretKey } = await req.json().catch(() => ({}));

    const candidateSecrets: string[] = [];
    if (Array.isArray(secretKey)) {
      candidateSecrets.push(...secretKey);
    } else if (secretKey) {
      candidateSecrets.push(secretKey);
    }
    if (rotatedSecretKey) {
      candidateSecrets.push(rotatedSecretKey);
    }

    if (candidateSecrets.length === 0) {
      return NextResponse.json(
        { success: false, error: "secretKey is required for cryptographic verification." },
        { status: 400 }
      );
    }

    const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload || {});
    const header = signatureHeader || generateHmacSignature(payloadStr, candidateSecrets[0]);

    const verification = verifyHmacSignature(header, payloadStr, candidateSecrets);

    return NextResponse.json({
      success: verification.valid,
      verifiedAt: new Date().toISOString(),
      timestamp: verification.timestamp,
      toleranceDeltaMs: verification.toleranceDeltaMs,
      headerUsed: header,
      matchedSecretPrefix: verification.matchedSecret,
      isRotatedSecretUsed: verification.isRotatedSecretUsed || false,
      reason: verification.reason || "Cryptographic HMAC SHA-256 signature verified."
    }, {
      status: verification.valid ? 200 : 401
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook verification failed" },
      { status: 500 }
    );
  }
}
