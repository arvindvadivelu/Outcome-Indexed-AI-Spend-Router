import crypto from "crypto";

export type ApiScope =
  | "routing:execute"
  | "routing:dry_run"
  | "logs:read"
  | "analytics:read"
  | "billing:read"
  | "billing:write"
  | "keys:manage"
  | "admin:full";

export interface ScopedApiKey {
  keyId: string;
  hashedSecret: string;
  prefix: string;
  tenantId: string;
  name: string;
  scopes: ApiScope[];
  ipAllowlist: string[]; // IP addresses or CIDR blocks
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt?: number;
  active: boolean;
}

export class TokenScopeGuard {
  private keyStore: Map<string, ScopedApiKey> = new Map();

  constructor() {
    // Seed default root demo scoped key
    this.createKey({
      tenantId: "org_enterprise_root",
      name: "Primary Production Key",
      scopes: ["admin:full", "routing:execute", "logs:read", "analytics:read"],
      ipAllowlist: ["*"],
      expiryDays: 365
    });
  }

  private hashKey(secret: string): string {
    return crypto.createHash("sha256").update(secret).digest("hex");
  }

  private isIpAllowed(clientIp: string, allowlist: string[]): boolean {
    if (allowlist.length === 0 || allowlist.includes("*")) return true;

    // Normalizing IPv6 loopback / localhost
    const normalizedIp = (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") ? "127.0.0.1" : clientIp;

    return allowlist.some(allowed => {
      if (allowed === normalizedIp || allowed === clientIp) return true;

      // Basic CIDR /24 prefix matching
      if (allowed.endsWith("/24")) {
        const subnet = allowed.replace("/24", "").split(".").slice(0, 3).join(".");
        const clientSubnet = normalizedIp.split(".").slice(0, 3).join(".");
        return subnet === clientSubnet;
      }

      return false;
    });
  }

  public createKey(params: {
    tenantId: string;
    name: string;
    scopes: ApiScope[];
    ipAllowlist?: string[];
    expiryDays?: number;
  }): { rawKey: string; keyRecord: ScopedApiKey } {
    const rawSecret = `sk_live_${crypto.randomBytes(24).toString("hex")}`;
    const keyId = `key_${crypto.randomBytes(6).toString("hex")}`;
    const prefix = rawSecret.slice(0, 12);
    const hashedSecret = this.hashKey(rawSecret);

    const expiresAt = params.expiryDays
      ? Date.now() + params.expiryDays * 24 * 60 * 60 * 1000
      : null;

    const keyRecord: ScopedApiKey = {
      keyId,
      hashedSecret,
      prefix,
      tenantId: params.tenantId,
      name: params.name,
      scopes: params.scopes,
      ipAllowlist: params.ipAllowlist || ["*"],
      createdAt: Date.now(),
      expiresAt,
      active: true
    };

    this.keyStore.set(keyId, keyRecord);
    return { rawKey: rawSecret, keyRecord };
  }

  public validateAccess(params: {
    keyId: string;
    requiredScope: ApiScope;
    clientIp: string;
  }): { allowed: boolean; reason?: string; statusCode: number; tenantId?: string } {
    const key = this.keyStore.get(params.keyId);

    if (!key || !key.active) {
      return { allowed: false, reason: "API key is invalid or deactivated", statusCode: 401 };
    }

    if (key.expiresAt && key.expiresAt < Date.now()) {
      return { allowed: false, reason: "API key has expired", statusCode: 401 };
    }

    if (!this.isIpAllowed(params.clientIp, key.ipAllowlist)) {
      return {
        allowed: false,
        reason: `Client IP ${params.clientIp} is not authorized for this API key`,
        statusCode: 403
      };
    }

    const hasScope = key.scopes.includes("admin:full") || key.scopes.includes(params.requiredScope);
    if (!hasScope) {
      return {
        allowed: false,
        reason: `Missing required scope: '${params.requiredScope}'. Key possesses: [${key.scopes.join(", ")}]`,
        statusCode: 403
      };
    }

    key.lastUsedAt = Date.now();
    return { allowed: true, statusCode: 200, tenantId: key.tenantId };
  }

  public listKeys(tenantId?: string): ScopedApiKey[] {
    const keys: ScopedApiKey[] = [];
    this.keyStore.forEach((k) => {
      if (!tenantId || k.tenantId === tenantId) {
        keys.push(k);
      }
    });
    return keys;
  }

  public revokeKey(keyId: string): boolean {
    const key = this.keyStore.get(keyId);
    if (!key) return false;
    key.active = false;
    return true;
  }
}

export const globalTokenScopeGuard = new TokenScopeGuard();
