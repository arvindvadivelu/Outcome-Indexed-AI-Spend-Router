import crypto from "crypto";

export interface TlsCertMetadata {
  serialNumber: string;
  domain: string;
  sanDomains: string[];
  issuer: string;
  fingerprintSha256: string;
  keyLengthBits: number;
  validFrom: number;
  validTo: number;
  daysRemaining: number;
  status: "VALID" | "RENEWAL_RECOMMENDED" | "RENEWAL_URGENT" | "EXPIRED";
  version: number;
  lastReloadedAt: number;
}

export class CertRenewalEngine {
  private activeCert: TlsCertMetadata;
  private renewalHistory: Array<{ timestamp: number; oldFingerprint: string; newFingerprint: string; version: number }> = [];

  constructor() {
    const now = Date.now();
    const validTo = now + 45 * 24 * 60 * 60 * 1000; // 45 days default
    const fingerprint = crypto.randomBytes(32).toString("hex");

    this.activeCert = {
      serialNumber: `0x${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
      domain: "api.spendrouter.ai",
      sanDomains: ["spendrouter.ai", "*.spendrouter.ai", "router.ai.internal"],
      issuer: "Let's Encrypt Authority E6 (ACME v2 Production)",
      fingerprintSha256: fingerprint,
      keyLengthBits: 4096,
      validFrom: now - 45 * 24 * 60 * 60 * 1000,
      validTo,
      daysRemaining: 45,
      status: "VALID",
      version: 1,
      lastReloadedAt: now
    };
  }

  public getCertStatus(): TlsCertMetadata {
    const now = Date.now();
    const msRemaining = this.activeCert.validTo - now;
    const daysRemaining = Math.max(0, Math.floor(msRemaining / (24 * 60 * 60 * 1000)));

    let status: TlsCertMetadata["status"] = "VALID";
    if (daysRemaining <= 0) {
      status = "EXPIRED";
    } else if (daysRemaining <= 15) {
      status = "RENEWAL_URGENT";
    } else if (daysRemaining <= 30) {
      status = "RENEWAL_RECOMMENDED";
    }

    this.activeCert.daysRemaining = daysRemaining;
    this.activeCert.status = status;
    return { ...this.activeCert };
  }

  public renewCertificate(options?: { domain?: string; keyLengthBits?: number }): {
    success: boolean;
    oldCert: { serialNumber: string; fingerprintSha256: string; version: number };
    newCert: TlsCertMetadata;
    durationMs: number;
  } {
    const start = performance.now();
    const now = Date.now();
    const oldCertCopy = {
      serialNumber: this.activeCert.serialNumber,
      fingerprintSha256: this.activeCert.fingerprintSha256,
      version: this.activeCert.version
    };

    const newFingerprint = crypto.randomBytes(32).toString("hex");
    const newVersion = this.activeCert.version + 1;
    const validTo = now + 90 * 24 * 60 * 60 * 1000; // Fresh 90 days

    this.activeCert = {
      serialNumber: `0x${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
      domain: options?.domain || this.activeCert.domain,
      sanDomains: this.activeCert.sanDomains,
      issuer: "Let's Encrypt Authority E6 (ACME v2 Production)",
      fingerprintSha256: newFingerprint,
      keyLengthBits: options?.keyLengthBits || 4096,
      validFrom: now,
      validTo,
      daysRemaining: 90,
      status: "VALID",
      version: newVersion,
      lastReloadedAt: now
    };

    this.renewalHistory.push({
      timestamp: now,
      oldFingerprint: oldCertCopy.fingerprintSha256,
      newFingerprint,
      version: newVersion
    });

    const durationMs = Math.round(performance.now() - start);

    return {
      success: true,
      oldCert: oldCertCopy,
      newCert: { ...this.activeCert },
      durationMs
    };
  }

  public getHistory() {
    return [...this.renewalHistory];
  }
}

export const globalCertRenewalEngine = new CertRenewalEngine();
