/**
 * 🛡️ Ingress Payload Size Guard & Body Limit Protection
 * Prevents memory exhaustion and event-loop blocking from payload bomb attacks.
 */

export interface PayloadInspectionResult {
  isAllowed: boolean;
  bytesReceived: number;
  maxAllowedBytes: number;
  status: "OK" | "PAYLOAD_TOO_LARGE";
  message: string;
}

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024; // 2MB max for standard JSON completions

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
