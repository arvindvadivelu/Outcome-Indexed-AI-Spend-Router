import { NextResponse } from "next/server";
import { globalCertRenewalEngine } from "@/lib/cert-renewal-engine";

export async function GET() {
  try {
    const cert = globalCertRenewalEngine.getCertStatus();
    const history = globalCertRenewalEngine.getHistory();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      certificate: cert,
      renewalHistory: history
    }, {
      headers: {
        "X-Cert-Status": cert.status,
        "X-Cert-Days-Remaining": cert.daysRemaining.toString(),
        "X-Cert-Version": cert.version.toString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve certificate status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, domain, keyLengthBits } = body;

    if (action === "RENEW" || !action) {
      const result = globalCertRenewalEngine.renewCertificate({
        domain,
        keyLengthBits
      });

      return NextResponse.json({
        success: result.success,
        action: "RENEW",
        message: "TLS certificate renewed and in-memory context hot-swapped",
        oldCert: result.oldCert,
        newCert: result.newCert,
        durationMs: result.durationMs
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported action: RENEW"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Certificate renewal failed" },
      { status: 500 }
    );
  }
}
