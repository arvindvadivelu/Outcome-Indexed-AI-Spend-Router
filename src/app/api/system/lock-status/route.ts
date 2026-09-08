import { NextResponse } from "next/server";
import { atomicLock } from "@/lib/atomic-lock";

export async function GET() {
  try {
    const stats = atomicLock.getLockStats();
    return NextResponse.json({
      success: true,
      status: "ACTIVE_LOCK_REGISTRY",
      activeLocksCount: stats.activeLocksCount,
      locks: stats.locks,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to query lock status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, resourceKey, ttlMs, holderId, lockToken } = body;

    if (!resourceKey) {
      return NextResponse.json(
        { success: false, error: "resourceKey is required" },
        { status: 400 }
      );
    }

    if (action === "acquire") {
      const result = atomicLock.acquireLock(resourceKey, ttlMs || 10000, holderId || "api_client");
      return NextResponse.json({
        success: result.success,
        lockToken: result.lockToken,
        expiresAt: result.expiresAt,
        error: result.error
      }, { status: result.success ? 200 : 409 });
    }

    if (action === "release") {
      if (!lockToken) {
        return NextResponse.json(
          { success: false, error: "lockToken is required for release" },
          { status: 400 }
        );
      }
      const result = atomicLock.releaseLock(resourceKey, lockToken);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported actions: 'acquire', 'release'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process lock operation" },
      { status: 500 }
    );
  }
}
