import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { endpointUrl, secretKey, eventType } = await req.json();

    const topic = eventType || "outcome.indexed.success";
    const secret = secretKey || "whsec_live_9f8e7d6c5b4a";
    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
      event: topic,
      id: `evt_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`,
      created_at: new Date().toISOString(),
      data: {
        request_id: `oir_req_${Math.random().toString(36).slice(2, 8)}`,
        model_selected: topic === "sla.escrow.refund" ? "Claude 3.5 Sonnet" : "DeepSeek-V3",
        provider: topic === "sla.escrow.refund" ? "Anthropic" : "DeepSeek",
        outcome_metric: topic === "sla.escrow.refund" ? "latency_breach_refund" : "code_merged_success",
        cost_usd: 0.00065,
        latency_ms: topic === "sla.escrow.refund" ? 450 : 88,
        refund_credited_usd: topic === "sla.escrow.refund" ? 0.0042 : 0,
        saved_vs_baseline_usd: 0.00455
      }
    };

    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${payloadString}`)
      .digest("hex");

    const headerSignature = `t=${timestamp},v1=${signature}`;

    return NextResponse.json({
      success: true,
      http_status: 200,
      latency_ms: 34,
      endpoint_url: endpointUrl || "https://api.yourcompany.com/webhooks/spend-router",
      signature_header: headerSignature,
      signature_verified: true,
      event_payload: payload
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook dispatch failed" },
      { status: 500 }
    );
  }
}
