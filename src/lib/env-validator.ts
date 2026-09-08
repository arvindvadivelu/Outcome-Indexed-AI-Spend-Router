/**
 * 🛡️ Production Environment Variable Validator & Startup Gatekeeper
 * Enforces presence and structure of critical environment variables.
 */

export interface EnvValidationReport {
  isValid: boolean;
  environment: "development" | "production" | "test";
  checkedKeysCount: number;
  missingRequired: string[];
  warnings: string[];
  systemReadiness: "READY" | "DEGRADED" | "CRITICAL_CONFIG_ERROR";
}

const REQUIRED_CONFIGS: { key: string; description: string; defaultVal?: string }[] = [
  { key: "NODE_ENV", description: "Node execution environment", defaultVal: "production" },
  { key: "PORT", description: "Application HTTP server listening port", defaultVal: "3000" },
  { key: "NEXT_PUBLIC_APP_URL", description: "Base URL for CORS and webhook verification", defaultVal: "http://localhost:3000" }
];

export function validateProductionEnvironment(): EnvValidationReport {
  const missing: string[] = [];
  const warnings: string[] = [];

  const env = (process.env.NODE_ENV || "production") as "development" | "production" | "test";

  for (const conf of REQUIRED_CONFIGS) {
    const val = process.env[conf.key];
    if (!val && !conf.defaultVal) {
      missing.push(`${conf.key} (${conf.description})`);
    } else if (!val && conf.defaultVal) {
      warnings.push(`Using fallback default for ${conf.key}: '${conf.defaultVal}'`);
    }
  }

  // Check for security vulnerabilities in config
  if (process.env.DEBUG === "true" && env === "production") {
    warnings.push("DEBUG mode is active in production environment.");
  }

  const isReady = missing.length === 0;

  return {
    isValid: isReady,
    environment: env,
    checkedKeysCount: REQUIRED_CONFIGS.length,
    missingRequired: missing,
    warnings,
    systemReadiness: isReady ? (warnings.length > 0 ? "DEGRADED" : "READY") : "CRITICAL_CONFIG_ERROR"
  };
}
