/**
 * 🛡️ Ingress Payload Size Guard & Recursion Depth Bomb Shield
 * Prevents memory exhaustion, call-stack overflow, and event-loop blocking from payload bomb attacks.
 */

export interface PayloadInspectionResult {
  isAllowed: boolean;
  bytesReceived: number;
  maxAllowedBytes: number;
  status: "OK" | "PAYLOAD_TOO_LARGE";
  message: string;
}

export interface JsonDepthInspectionResult {
  isSafe: boolean;
  maxCalculatedDepth: number;
  maxAllowedDepth: number;
  status: "OK" | "RECURSION_DEPTH_EXCEEDED";
  message: string;
}

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024; // 2MB max for standard JSON completions
const DEFAULT_MAX_JSON_DEPTH = 32; // Maximum safe object nesting depth

export function inspectPayloadSize(
  rawContentLength: string | null | undefined,
  bodyText?: string,
  maxBytes: number = DEFAULT_MAX_BYTES
): PayloadInspectionResult {
  let size = 0;

  if (rawContentLength) {
    const parsed = parseInt(rawContentLength, 10);
    if (!isNaN(parsed)) {
      size = parsed;
    }
  }

  if (!size && bodyText) {
    size = Buffer.byteLength(bodyText, "utf-8");
  }

  const isAllowed = size <= maxBytes;

  return {
    isAllowed,
    bytesReceived: size,
    maxAllowedBytes: maxBytes,
    status: isAllowed ? "OK" : "PAYLOAD_TOO_LARGE",
    message: isAllowed
      ? `Payload size of ${size} bytes is within acceptable limits (${maxBytes} bytes).`
      : `Payload size ${size} bytes exceeds maximum allowed threshold of ${maxBytes} bytes.`
  };
}

export function inspectJsonDepth(
  data: any,
  maxDepth: number = DEFAULT_MAX_JSON_DEPTH
): JsonDepthInspectionResult {
  let maxFoundDepth = 1;

  function calculateDepth(obj: any, currentDepth: number): boolean {
    if (currentDepth > maxFoundDepth) {
      maxFoundDepth = currentDepth;
    }

    if (currentDepth > maxDepth) {
      return false; // Depth limit exceeded
    }

    if (obj && typeof obj === "object") {
      if (Array.isArray(obj)) {
        for (const item of obj) {
          if (!calculateDepth(item, currentDepth + 1)) return false;
        }
      } else {
        for (const key of Object.keys(obj)) {
          if (!calculateDepth(obj[key], currentDepth + 1)) return false;
        }
      }
    }

    return true;
  }

  const isSafe = calculateDepth(data, 1);

  return {
    isSafe,
    maxCalculatedDepth: maxFoundDepth,
    maxAllowedDepth: maxDepth,
    status: isSafe ? "OK" : "RECURSION_DEPTH_EXCEEDED",
    message: isSafe
      ? `JSON nesting depth of ${maxFoundDepth} is within safe operational limit (${maxDepth}).`
      : `JSON nesting depth of ${maxFoundDepth} exceeds maximum allowed depth limit of ${maxDepth}.`
  };
}

