import crypto from "crypto";

/**
 * 🛡️ Constant-Time Cryptographic HMAC SHA-256 Signature Guard
 * Eliminates side-channel timing attack vectors when verifying inbound webhook signatures.
 * Supports Dual-Secret Staged Key Rollover during enterprise secret rotation windows.
 */

export interface HmacVerificationResult {
  valid: boolean;
  timestamp: number;
  toleranceDeltaMs: number;
  matchedSecret?: string;
  isRotatedSecretUsed?: boolean;
  reason?: string;
}

export function generateHmacSignature(payloadStr: string, secretKey: string, timestamp: number = Math.floor(Date.now() / 1000)): string {
  const signaturePayload = `${timestamp}.${payloadStr}`;
  const hmac = crypto.createHmac("sha256", secretKey).update(signaturePayload).digest("hex");
  return `t=${timestamp},v1=${hmac}`;
}

export function verifyHmacSignature(
  headerString: string,
  payloadStr: string,
  secretKey: string | string[],
  maxToleranceSeconds: number = 300 // 5 minutes
): HmacVerificationResult {
  const secrets = Array.isArray(secretKey) ? secretKey.filter(Boolean) : [secretKey].filter(Boolean);

  if (!headerString || secrets.length === 0) {
    return { valid: false, timestamp: 0, toleranceDeltaMs: 0, reason: "Missing header or secret" };
  }

  // Parse header t=1234567890,v1=abcdef...
  const parts = headerString.split(",");
  let timestampStr = "";
  let receivedHash = "";

  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k?.trim() === "t") timestampStr = v?.trim() || "";
    if (k?.trim() === "v1") receivedHash = v?.trim() || "";
  }

  const timestamp = parseInt(timestampStr);
  if (isNaN(timestamp)) {
    return { valid: false, timestamp: 0, toleranceDeltaMs: 0, reason: "Invalid signature timestamp" };
  }

  // Tolerance check
  const now = Math.floor(Date.now() / 1000);
  const deltaSeconds = Math.abs(now - timestamp);
  if (deltaSeconds > maxToleranceSeconds) {
    return {
      valid: false,
      timestamp,
      toleranceDeltaMs: deltaSeconds * 1000,
      reason: `Signature expired (${deltaSeconds}s old, max tolerance is ${maxToleranceSeconds}s)`
    };
  }

  const expectedPayload = `${timestamp}.${payloadStr}`;
  const receivedBuf = Buffer.from(receivedHash, "hex");

  for (let i = 0; i < secrets.length; i++) {
    const candidateSecret = secrets[i];
    const expectedHash = crypto.createHmac("sha256", candidateSecret).update(expectedPayload).digest("hex");
    const expectedBuf = Buffer.from(expectedHash, "hex");

    if (receivedBuf.length === expectedBuf.length && crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
      return {
        valid: true,
        timestamp,
        toleranceDeltaMs: deltaSeconds * 1000,
        matchedSecret: candidateSecret.slice(0, 10) + "...",
        isRotatedSecretUsed: i > 0
      };
    }
  }

  return {
    valid: false,
    timestamp,
    toleranceDeltaMs: deltaSeconds * 1000,
    reason: "Signature hash mismatch against all candidate secrets in truststore"
  };
}
