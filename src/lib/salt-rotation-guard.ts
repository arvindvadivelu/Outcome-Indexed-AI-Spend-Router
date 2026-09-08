import crypto from "crypto";

/**
 * 🛡️ Multi-Generation Dynamic Salt Rotation Guard
 * Enables zero-downtime salt rotation for user security PINs and session tokens.
 * Verifies credentials against both current and legacy salt generations,
 * transparently returning upgraded hashes for database synchronization.
 */

const CURRENT_SALT_VERSION = "v2";
const ACTIVE_SALT = process.env.SESSION_SALT_V2 || "oir_prod_salt_generation_2_2026";
const LEGACY_SALTS: Array<{ version: string; salt: string }> = [
  { version: "v1", salt: process.env.SESSION_SALT_V1 || "oir_prod_salt_generation_1_2025" },
  { version: "v0_plain", salt: "" } // Plaintext legacy fallback
];

export function hashWithSalt(plainText: string, salt: string = ACTIVE_SALT, version: string = CURRENT_SALT_VERSION): string {
  const digest = crypto.createHmac("sha256", salt).update(plainText).digest("hex");
  return `oir_hash_${version}:${digest}`;
}

export function verifyAndUpgradeCredential(
  rawInput: string,
  storedValue: string
): {
  valid: boolean;
  needsRehash: boolean;
  upgradedHash?: string;
  matchedVersion?: string;
} {
  if (!rawInput || !storedValue) {
    return { valid: false, needsRehash: false };
  }

  const trimmedInput = rawInput.trim();
  const trimmedStored = storedValue.trim();

  // 1. Check against Active Salt (Current Generation)
  const currentExpected = hashWithSalt(trimmedInput, ACTIVE_SALT, CURRENT_SALT_VERSION);
  if (trimmedStored === currentExpected) {
    return {
      valid: true,
      needsRehash: false,
      matchedVersion: CURRENT_SALT_VERSION
    };
  }

  // 2. Check against Legacy Salts (v1, etc.)
  for (const legacy of LEGACY_SALTS) {
    if (legacy.version === "v0_plain") {
      // Direct string comparison for legacy unhashed PINs
      if (trimmedStored === trimmedInput) {
        return {
          valid: true,
          needsRehash: true,
          upgradedHash: currentExpected,
          matchedVersion: "v0_plain"
        };
      }
    } else {
      const legacyExpected = hashWithSalt(trimmedInput, legacy.salt, legacy.version);
      if (trimmedStored === legacyExpected) {
        return {
          valid: true,
          needsRehash: true,
          upgradedHash: currentExpected,
          matchedVersion: legacy.version
        };
      }
    }
  }

  return { valid: false, needsRehash: false };
}
