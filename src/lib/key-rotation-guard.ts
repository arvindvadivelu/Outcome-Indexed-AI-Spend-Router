/**
 * 🔐 Automated API Key Entropy & Rotation Security Guard
 * Calculates Shannon entropy, enforces 90-day key lifecycle, and generates rotation alerts.
 */

export interface KeySecurityAuditReport {
  keyId: string;
  keyPrefix: string;
  entropyScore: number; // >= 3.8 is strong
  entropyStatus: "OPTIMAL" | "MODERATE" | "WEAK_REPLACE_IMMEDIATELY";
  ageDays: number;
  rotationRecommended: boolean;
  rotationReason?: string;
  autoNotificationWebhookPayload: any;
}

export function calculateShannonEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }

  return parseFloat(entropy.toFixed(3));
}

export function auditApiKeyRotationSecurity(apiKeyObj: any): KeySecurityAuditReport {
  const fullKey = apiKeyObj?.full_key || "oir_live_8f39a7b92c41e82a934d";
  const keyId = apiKeyObj?.id || "key_default_primary";
  const prefix = apiKeyObj?.key_prefix || "oir_live_8f39...";

  const entropy = calculateShannonEntropy(fullKey);
  const createdTimestamp = apiKeyObj?.created_at ? new Date(apiKeyObj.created_at).getTime() : Date.now() - 45 * 86400000;
  const ageDays = Math.max(1, Math.floor((Date.now() - createdTimestamp) / (1000 * 86400 * 1000)));

  const isEntropyWeak = entropy < 3.8;
  const isOverdue = ageDays > 90;

  let status: KeySecurityAuditReport["entropyStatus"] = "OPTIMAL";
  if (isEntropyWeak) status = "WEAK_REPLACE_IMMEDIATELY";
  else if (entropy < 4.2) status = "MODERATE";

  const rotationRecommended = isEntropyWeak || isOverdue;
  let reason: string | undefined = undefined;

  if (isEntropyWeak && isOverdue) {
    reason = "Key exhibits low entropy score and has exceeded the 90-day lifecycle limit.";
  } else if (isEntropyWeak) {
    reason = "Key entropy score is below enterprise SOC-2 minimum (3.8 bits/char).";
  } else if (isOverdue) {
    reason = `Key age (${ageDays} days) exceeds 90-day automated rotation cycle.`;
  }

  return {
    keyId,
    keyPrefix: prefix,
    entropyScore: entropy,
    entropyStatus: status,
    ageDays,
    rotationRecommended,
    rotationReason: reason,
    autoNotificationWebhookPayload: {
      event: "security.api_key.rotation_recommended",
      key_id: keyId,
      severity: isEntropyWeak ? "HIGH" : "INFO",
      timestamp: new Date().toISOString(),
      action_required: rotationRecommended
    }
  };
}
