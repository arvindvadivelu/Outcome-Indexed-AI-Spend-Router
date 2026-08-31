/**
 * 🛡️ Fast Heuristic Prompt Injection & Jailbreak Scanner
 * Detects system prompt bypass attempts, role-play jailbreaks, and token delimiters.
 */

export interface PromptScanResult {
  isSafe: boolean;
  threatLevel: "CLEAN" | "LOW_RISK" | "HIGH_RISK_INJECTION";
  detectedPatterns: string[];
  sanitizedPrompt: string;
  reason: string;
}

const INJECTION_PATTERNS = [
  { name: "System Prompt Override", regex: /ignore\s+(all\s+)?previous\s+instructions/i },
  { name: "DAN Jailbreak Attempt", regex: /\b(DAN\s+mode|jailbreak|unrestricted\s+ai)\b/i },
  { name: "ChatML Delimiter Injection", regex: /(<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\])/i },
  { name: "Role Hijacking", regex: /\b(you\s+are\s+now\s+in\s+developer\s+mode)\b/i }
];

export function scanAndSanitizePrompt(rawPrompt: string): PromptScanResult {
  if (!rawPrompt || typeof rawPrompt !== "string") {
    return {
      isSafe: true,
      threatLevel: "CLEAN",
      detectedPatterns: [],
      sanitizedPrompt: "",
      reason: "Empty prompt validated clean."
    };
  }

  const detected: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(rawPrompt)) {
      detected.push(pattern.name);
    }
  }

  if (detected.length > 0) {
    return {
      isSafe: false,
      threatLevel: "HIGH_RISK_INJECTION",
      detectedPatterns: detected,
      sanitizedPrompt: rawPrompt.replace(/(<\|im_start\|>|<\|im_end\|>)/gi, ""),
      reason: `Prompt rejected due to high-risk injection patterns: ${detected.join(", ")}.`
    };
  }

  return {
    isSafe: true,
    threatLevel: "CLEAN",
    detectedPatterns: [],
    sanitizedPrompt: rawPrompt.trim(),
    reason: "Prompt verified safe with zero injection patterns detected."
  };
}
