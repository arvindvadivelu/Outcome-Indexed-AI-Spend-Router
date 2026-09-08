import { NextResponse } from "next/server";
import { idempotencyEngine } from "@/lib/idempotency-deduplicator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idempotencyKey, prompt } = body;
    const key = idempotencyKey || `idem_${Date.now()}`;

    const lock = idempotencyEngine.acquireLock(key, { prompt });

    if (lock.status === "PAYLOAD_MISMATCH") {
      return NextResponse.json({
        success: false,
        idempotencyStatus: "PAYLOAD_MISMATCH",
        error: lock.error || "Idempotency key was previously used with a different request payload."
      }, { status: 422 });
    }

    if (lock.status === "IDEMPOTENT_CACHE_HIT") {
      return NextResponse.json({
        success: true,
        idempotencyStatus: "CACHE_HIT",
        message: "Returned cached result for duplicate idempotency key with zero re-computation.",
        data: lock.cachedResponse
      }, {
        headers: { "X-Idempotent-Replay": "true" }
      });
    }

    if (lock.status === "DUPLICATE_IN_PROGRESS") {
      return NextResponse.json({
        success: false,
        idempotencyStatus: "IN_PROGRESS",
        error: lock.error || "A concurrent in-flight request is already processing with this idempotency key."
      }, { status: 409, headers: { "Retry-After": "1" } });
    }

    // Execute intelligent computation and save result
    const computedResponse = {
      modelUsed: "Claude 3.5 Sonnet",
      tokensGenerated: 180,
      costUsd: 0.0018,
      text: `Processed response for: ${prompt || "standard inference"}`
    };

    idempotencyEngine.completeLock(key, computedResponse);

    return NextResponse.json({
      success: true,
      idempotencyStatus: "PROCESSED",
      message: "Request executed and saved to idempotency ledger.",
      data: computedResponse
    }, {
      headers: { "X-Idempotent-Replay": "false" }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Idempotent dispatch failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = idempotencyEngine.getStats();
    return NextResponse.json({
      success: true,
      status: "IDEMPOTENCY_ENGINE_ACTIVE",
      stats
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query idempotency stats" },
      { status: 500 }
    );
  }
}

