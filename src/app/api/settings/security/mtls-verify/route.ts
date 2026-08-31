import { NextResponse } from "next/server";
import { parseAndVerifyClientCertificate } from "@/lib/mtls-guard";

export async function POST(req: Request) {
  try {
    const { clientCertificatePem } = await req.json().catch(() => ({}));

    if (!clientCertificatePem) {
      return NextResponse.json(
        { success: false, error: "clientCertificatePem is required." },
        { status: 400 }
      );
    }

    const verification = parseAndVerifyClientCertificate(clientCertificatePem);

    return NextResponse.json({
      success: verification.valid,
      verifiedAt: new Date().toISOString(),
      reason: verification.reason,
      certificate: verification.certInfo
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "mTLS verification failed" },
      { status: 500 }
    );
  }
}
