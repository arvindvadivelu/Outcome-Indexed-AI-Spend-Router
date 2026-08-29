export type PlanTier = "free" | "starter" | "growth" | "enterprise";

export interface PlanFeatures {
  monthlyTokenQuota: number;
  maxActiveRules: number;
  logRetentionDays: number;
  allowedConnectors: string[]; // e.g. ["openai", "anthropic", "groq"] for free
  canUseAutopilot: boolean;
  canUseAiRuleSynthesis: boolean;
  canUseSpeculativePrewarm: boolean;
  canUseSemanticDeltaDiff: boolean;
  canUseDifferentialPrivacy: boolean;
  canUseMicroSlaEscrow: boolean;
  canUseWebhooks: boolean;
  canUseCustomIntegrations: boolean;
  supportLevel: string;
}

export const PLAN_LIMITS: Record<PlanTier, PlanFeatures> = {
  free: {
    monthlyTokenQuota: 10000,
    maxActiveRules: 2,
    logRetentionDays: 3,
    allowedConnectors: ["openai", "anthropic", "groq"],
    canUseAutopilot: false,
    canUseAiRuleSynthesis: false,
    canUseSpeculativePrewarm: false,
    canUseSemanticDeltaDiff: false,
    canUseDifferentialPrivacy: false,
    canUseMicroSlaEscrow: false,
    canUseWebhooks: false,
    canUseCustomIntegrations: false,
    supportLevel: "Community Discord"
  },
  starter: {
    monthlyTokenQuota: 100000,
    maxActiveRules: 5,
    logRetentionDays: 30,
    allowedConnectors: ["openai", "anthropic", "groq", "deepseek", "litellm"],
    canUseAutopilot: true,
    canUseAiRuleSynthesis: true,
    canUseSpeculativePrewarm: false,
    canUseSemanticDeltaDiff: false,
    canUseDifferentialPrivacy: false,
    canUseMicroSlaEscrow: true,
    canUseWebhooks: true,
    canUseCustomIntegrations: true,
    supportLevel: "Standard Email (24h SLA)"
  },
  growth: {
    monthlyTokenQuota: 500000,
    maxActiveRules: 9999,
    logRetentionDays: 90,
    allowedConnectors: ["openai", "anthropic", "groq", "deepseek", "litellm", "langchain", "llamaindex", "vercel", "crewai"],
    canUseAutopilot: true,
    canUseAiRuleSynthesis: true,
    canUseSpeculativePrewarm: true,
    canUseSemanticDeltaDiff: true,
    canUseDifferentialPrivacy: true,
    canUseMicroSlaEscrow: true,
    canUseWebhooks: true,
    canUseCustomIntegrations: true,
    supportLevel: "Dedicated Slack Channel"
  },
  enterprise: {
    monthlyTokenQuota: 2000000,
    maxActiveRules: 9999,
    logRetentionDays: 365,
    allowedConnectors: ["openai", "anthropic", "groq", "deepseek", "litellm", "langchain", "llamaindex", "vercel", "crewai"],
    canUseAutopilot: true,
    canUseAiRuleSynthesis: true,
    canUseSpeculativePrewarm: true,
    canUseSemanticDeltaDiff: true,
    canUseDifferentialPrivacy: true,
    canUseMicroSlaEscrow: true,
    canUseWebhooks: true,
    canUseCustomIntegrations: true,
    supportLevel: "Dedicated Enterprise Architect"
  }
};

export function getPlanFeatures(tier: string | undefined): PlanFeatures {
  const normalized = (tier?.toLowerCase() || "free") as PlanTier;
  return PLAN_LIMITS[normalized] || PLAN_LIMITS.free;
}

export function isConnectorAllowed(tier: string | undefined, connectorId: string): boolean {
  const features = getPlanFeatures(tier);
  const normalizedId = connectorId.toLowerCase();
  return features.allowedConnectors.some(c => normalizedId.includes(c) || c.includes(normalizedId));
}
