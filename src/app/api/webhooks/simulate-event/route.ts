import { NextResponse } from "next/server";
import { generateHmacSignature } from "@/lib/hmac-guard";

export async function POST(req: Request) {
  try {
    const { eventType, endpointUrl, secretKey } = await req.json().catch(() => ({}));
    const event = eventType || "router.sla_breach";
    const secret = secretKey || "whsec_live_9a8b7c6d5e4f3a2b1c0d";

    const payload = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type: event,
      timestamp: Math.floor(Date.now() / 1000),
      data: {
        provider: "openai",
        recordedLatencyMs: 380,
        guaranteedCeilingMs: 250,
        overshootMs: 130,
        refundCreditUsd: 0.00130,
        slaContractNonce: "sha256:8f39a7b92c41e82a934d"
      }
    };

    const payloadStr = JSON.stringify(payload);
    const signatureHeader = generateHmacSignature(payloadStr, secret);

    return NextResponse.json({
      success: true,
      simulatedAt: new Date().toISOString(),
      dispatchedEvent: event,
      targetEndpoint: endpointUrl || "https://client-gateway.internal/webhooks",
      signatureHeader,
      payload
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook simulation failed" },
      { status: 500 }
    );
  }
}
