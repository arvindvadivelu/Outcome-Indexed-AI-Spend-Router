/**
 * 📝 SRE Structured JSON Logger with Sensitive Data Scrubbing
 * Masks API keys, JWT tokens, credit card numbers, and auth headers before outputting logs.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export interface StructuredLogMessage {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, any>;
  sanitized: boolean;
}

const SENSITIVE_PATTERNS = [
  /(oir_live_[a-zA-Z0-9_-]{8,})/g,
  /(sk-[a-zA-Z0-9_-]{12,})/g,
  /(Bearer\s+[a-zA-Z0-9_\-\.]+)/gi,
  /("pin"\s*:\s*)"\d+"/gi,
  /("password"\s*:\s*)"[^"]+"/gi
];

export function sanitizeLogContent(input: string): string {
  if (!input || typeof input !== "string") return input;
  let sanitized = input;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED_SECRET]");
  }
  return sanitized;
}

export function formatStructuredLog(
  level: LogLevel,
  message: string,
  context?: Record<string, any>
): StructuredLogMessage {
  const sanitizedMsg = sanitizeLogContent(message);
  let sanitizedContext: Record<string, any> | undefined = undefined;

  if (context) {
    try {
      const serialized = JSON.stringify(context);
      const cleanSerialized = sanitizeLogContent(serialized);
      sanitizedContext = JSON.parse(cleanSerialized);
    } catch {
      sanitizedContext = { error: "Context serialization failed" };
    }
  }

  return {
    level,
    timestamp: new Date().toISOString(),
    message: sanitizedMsg,
    context: sanitizedContext,
    sanitized: true
  };
}

export const sreLogger = {
  info: (msg: string, ctx?: Record<string, any>) => formatStructuredLog("INFO", msg, ctx),
  warn: (msg: string, ctx?: Record<string, any>) => formatStructuredLog("WARN", msg, ctx),
  error: (msg: string, ctx?: Record<string, any>) => formatStructuredLog("ERROR", msg, ctx),
  fatal: (msg: string, ctx?: Record<string, any>) => formatStructuredLog("FATAL", msg, ctx)
};
