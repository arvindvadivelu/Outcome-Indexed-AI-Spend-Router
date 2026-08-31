import crypto from "crypto";

/**
 * 🛡️ Constant-Time Cryptographic HMAC SHA-256 Signature Guard
 * Eliminates side-channel timing attack vectors when verifying inbound webhook signatures.
 */

export interface HmacVerificationResult {
  valid: boolean;
  timestamp: number;
  toleranceDeltaMs: number;
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
  secretKey: string,
  maxToleranceSeconds: number = 300 // 5 minutes
): HmacVerificationResult {
  if (!headerString || !secretKey) {
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

  // Reconstruct expected signature
  const expectedPayload = `${timestamp}.${payloadStr}`;
  const expectedHash = crypto.createHmac("sha256", secretKey).update(expectedPayload).digest("hex");

  // Constant-time comparison to prevent timing attacks
  const receivedBuf = Buffer.from(receivedHash, "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");

  if (receivedBuf.length !== expectedBuf.length) {
    return { valid: false, timestamp, toleranceDeltaMs: deltaSeconds * 1000, reason: "Signature length mismatch" };
  }

  const matches = crypto.timingSafeEqual(receivedBuf, expectedBuf);

  return {
    valid: matches,
    timestamp,
    toleranceDeltaMs: deltaSeconds * 1000,
    reason: matches ? undefined : "Signature hash mismatch"
  };
}
