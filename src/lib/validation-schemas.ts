/**
 * 🛡️ Strict Input Validation & Schema Sanitization Engine
 * Runtime type checking, regex constraints, and injection protection for router rules.
 */

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  sanitizedPayload?: any;
  issues: ValidationIssue[];
}

export function validateRoutingRule(payload: any): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, issues: [{ field: "root", message: "Payload must be a JSON object" }] };
  }

  // Name validation
  if (!payload.name || typeof payload.name !== "string" || payload.name.trim().length < 3) {
    issues.push({ field: "name", message: "Rule name must be at least 3 characters" });
  } else if (payload.name.length > 80) {
    issues.push({ field: "name", message: "Rule name must not exceed 80 characters" });
  }

  // Target task domain validation
  const validDomains = ["sales_email", "code_generation", "customer_support", "complex_reasoning", "general_instruction", "auto"];
  if (payload.target_task && !validDomains.includes(payload.target_task)) {
    issues.push({
      field: "target_task",
      message: `Invalid target_task. Must be one of: ${validDomains.join(", ")}`
    });
  }

  // Max cost ceiling validation
  if (payload.max_cost_usd !== undefined) {
    const cost = Number(payload.max_cost_usd);
    if (isNaN(cost) || cost < 0 || cost > 1.0) {
      issues.push({ field: "max_cost_usd", message: "max_cost_usd must be a number between 0.0 and 1.0" });
    }
  }

  // Max latency ceiling validation
  if (payload.max_latency_ms !== undefined) {
    const latency = Number(payload.max_latency_ms);
    if (isNaN(latency) || latency < 10 || latency > 60000) {
      issues.push({ field: "max_latency_ms", message: "max_latency_ms must be an integer between 10ms and 60,000ms" });
    }
  }

  // Priority models chain validation
  if (payload.priority_models !== undefined) {
    if (!Array.isArray(payload.priority_models) || payload.priority_models.length === 0) {
      issues.push({ field: "priority_models", message: "priority_models must be a non-empty array of model strings" });
    }
  }

  // Sanitize strings against script injection
  const sanitized: any = { ...payload };
  if (typeof sanitized.name === "string") {
    sanitized.name = sanitized.name.replace(/[<>]/g, "").trim();
  }
  if (typeof sanitized.description === "string") {
    sanitized.description = sanitized.description.replace(/[<>]/g, "").trim();
  }

  return {
    valid: issues.length === 0,
    sanitizedPayload: issues.length === 0 ? sanitized : undefined,
    issues
  };
}
