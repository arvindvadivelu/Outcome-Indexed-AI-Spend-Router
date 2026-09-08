/**
 * 🛡️ Enterprise Adversarial Prompt Injection & Canary Token Guard
 * Scans prompts and completions for jailbreak attempts, system prompt exfiltration,
 * delimiter smuggling, and canary token leakage.
 */

export interface PromptScanResult {
  isSafe: boolean;
  threatLevel: "CLEAN" | "LOW_RISK" | "HIGH_RISK_INJECTION" | "CANARY_LEAK_CRITICAL";
  detectedPatterns: string[];
  sanitizedPrompt: string;
  canaryLeakDetected: boolean;
  reason: string;
}

const INJECTION_PATTERNS = [
  { name: "System Prompt Override", regex: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i },
  { name: "DAN Jailbreak Attempt", regex: /\b(DAN\s+mode|jailbreak|unrestricted\s+ai|always\s+say\s+yes)\b/i },
  { name: "ChatML Delimiter Injection", regex: /(<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\]|<<SYS>>|<<\/SYS>>|<\|user\|>|<\|assistant\|>|<\|endoftext\|>)/i },
  { name: "Role Hijacking", regex: /\b(you\s+are\s+now\s+in\s+developer\s+mode|act\s+as\s+an\s+unfiltered\s+terminal)\b/i },
  { name: "System Prompt Exfiltration", regex: /(print|output|repeat|show|reveal)\s+(the\s+)?(system\s+prompt|above\s+instructions|initial\s+prompt|core\s+rules)(\s+verbatim|\s+in\s+base64|\s+in\s+json|\s+in\s+rot13)?/i },
  { name: "Canary Token Pattern", regex: /(oir_canary_[a-zA-Z0-9_\-]+|canary_sec_[a-zA-Z0-9_\-]+|sk-ant-canary-[a-zA-Z0-9_\-]+)/i }
];

export function scanAndSanitizePrompt(rawPrompt: string, knownCanaries: string[] = []): PromptScanResult {
  if (!rawPrompt || typeof rawPrompt !== "string") {
    return {
      isSafe: true,
      threatLevel: "CLEAN",
      detectedPatterns: [],
      sanitizedPrompt: "",
      canaryLeakDetected: false,
      reason: "Empty prompt validated clean."
    };
  }

  const detected: string[] = [];
  let canaryLeak = false;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(rawPrompt)) {
      detected.push(pattern.name);
      if (pattern.name === "Canary Token Pattern") {
        canaryLeak = true;
      }
    }
  }

  for (const canary of knownCanaries) {
    if (canary && rawPrompt.includes(canary)) {
      detected.push(`Canary Match (${canary.slice(0, 8)}...)`);
      canaryLeak = true;
    }
  }

  if (canaryLeak) {
    return {
      isSafe: false,
      threatLevel: "CANARY_LEAK_CRITICAL",
      detectedPatterns: detected,
      sanitizedPrompt: rawPrompt.replace(/(oir_canary_[a-zA-Z0-9_\-]+|canary_sec_[a-zA-Z0-9_\-]+)/gi, "[REDACTED_CANARY]"),
      canaryLeakDetected: true,
      reason: "Prompt or output contains unauthorized cryptographic canary token."
    };
  }

  if (detected.length > 0) {
    return {
      isSafe: false,
      threatLevel: "HIGH_RISK_INJECTION",
      detectedPatterns: detected,
      sanitizedPrompt: rawPrompt.replace(/(<\|im_start\|>|<\|im_end\|>|<<SYS>>|<<\/SYS>>)/gi, ""),
      canaryLeakDetected: false,
      reason: `Prompt rejected due to high-risk injection patterns: ${detected.join(", ")}.`
    };
  }

  return {
    isSafe: true,
    threatLevel: "CLEAN",
    detectedPatterns: [],
    sanitizedPrompt: rawPrompt.trim(),
    canaryLeakDetected: false,
    reason: "Prompt verified safe with zero injection or canary patterns detected."
  };
}

export function scanCompletionForCanaryLeak(completionText: string, canaryTokens: string[] = []): { safe: boolean; sanitized: string } {
  const result = scanAndSanitizePrompt(completionText, canaryTokens);
  return {
    safe: !result.canaryLeakDetected,
    sanitized: result.sanitizedPrompt
  };
}
