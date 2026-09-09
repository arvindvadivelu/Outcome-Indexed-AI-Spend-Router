import { NextResponse } from "next/server";
import { globalTokenScopeGuard, ApiScope } from "@/lib/token-scope-guard";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId") || undefined;
    const keys = globalTokenScopeGuard.listKeys(tenantId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      keyCount: keys.length,
      keys: keys.map(k => ({
        keyId: k.keyId,
        prefix: k.prefix,
        name: k.name,
        tenantId: k.tenantId,
        scopes: k.scopes,
        ipAllowlist: k.ipAllowlist,
        createdAt: k.createdAt,
        expiresAt: k.expiresAt,
        active: k.active
      }))
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list scoped keys" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, tenantId, name, scopes, ipAllowlist, expiryDays, keyId, requiredScope, clientIp } = body;

    if (action === "CREATE") {
      if (!tenantId || !name || !Array.isArray(scopes) || scopes.length === 0) {
        return NextResponse.json(
          { success: false, error: "Missing tenantId, name, or valid non-empty scopes array" },
          { status: 400 }
        );
      }

      const { rawKey, keyRecord } = globalTokenScopeGuard.createKey({
        tenantId,
        name,
        scopes: scopes as ApiScope[],
        ipAllowlist,
        expiryDays
      });

      return NextResponse.json({
        success: true,
        action: "CREATE",
        rawKey,
        key: {
          keyId: keyRecord.keyId,
          prefix: keyRecord.prefix,
          name: keyRecord.name,
          tenantId: keyRecord.tenantId,
          scopes: keyRecord.scopes,
          ipAllowlist: keyRecord.ipAllowlist,
          expiresAt: keyRecord.expiresAt
        }
      });
    }

    if (action === "VALIDATE") {
      if (!keyId || !requiredScope) {
        return NextResponse.json(
          { success: false, error: "Missing keyId or requiredScope" },
          { status: 400 }
        );
      }

      const ip = clientIp || req.headers.get("x-forwarded-for") || "127.0.0.1";
      const result = globalTokenScopeGuard.validateAccess({
        keyId,
        requiredScope: requiredScope as ApiScope,
        clientIp: ip
      });

      return NextResponse.json({
        success: result.allowed,
        action: "VALIDATE",
        keyId,
        requiredScope,
        clientIp: ip,
        statusCode: result.statusCode,
        reason: result.reason,
        tenantId: result.tenantId
      }, { status: result.statusCode });
    }

    if (action === "REVOKE") {
      if (!keyId) {
        return NextResponse.json({ success: false, error: "Missing keyId for REVOKE" }, { status: 400 });
      }

      const revoked = globalTokenScopeGuard.revokeKey(keyId);
      return NextResponse.json({
        success: revoked,
        action: "REVOKE",
        keyId
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid action. Supported actions: CREATE, VALIDATE, REVOKE"
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Scope guard operation failed" },
      { status: 500 }
    );
  }
}
