import crypto from "crypto";

/**
 * 🛡️ Constant-Time Cryptographic Comparison & Side-Channel Defense
 * Protects API keys, session tokens, and security signatures against sub-microsecond timing attacks.
 */

/**
 * Compares two strings in constant time by hashing them to fixed 32-byte digests
 * before running crypto.timingSafeEqual().
 */
export function constantTimeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }

  // Pre-hash both strings to SHA-256 buffers to guarantee identical length
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Compares an API key candidate against a target key or prefix in constant time.
 */
export function constantTimeKeyMatch(candidateKey: string, fullStoredKey: string): boolean {
  if (!candidateKey || !fullStoredKey) {
    return false;
  }
  return constantTimeCompare(candidateKey.trim(), fullStoredKey.trim());
}
