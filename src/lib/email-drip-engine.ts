/**
 * 📧 Automated Re-Engagement & Lifecycle Drip Dispatcher
 * Analyzes dormant user telemetry and triggers contextual FinOps savings email campaigns.
 */

export interface DripCampaign {
  id: string;
  email: string;
  triggerReason: "DORMANT_INFERENCE" | "HIGH_COST_ALERT" | "BUDGET_PACE_EXCEEDED" | "ONBOARDING_NUDGE";
  subject: string;
  potentialMonthlySavingsUsd: number;
  simulatedWebhookSent: boolean;
  recommendedModel: string;
  dispatchedAt: string;
}

export function evaluateDripCampaignForUser(user: any): DripCampaign {
  const email = user?.email || "user@enterprise.ai";
  const logs = user?.logs || [];
  const spend = user?.monthlySpendUSD || 0;

  let trigger: DripCampaign["triggerReason"] = "DORMANT_INFERENCE";
  let subject = "⚡ Slash your AI spend by 42% with Outcome-Indexed Routing";
  let savings = 340.0;
  let model = "DeepSeek-V3";

  if (logs.length > 50) {
    trigger = "HIGH_COST_ALERT";
    subject = "💡 FinOps Alert: Switch your code review queries to DeepSeek-V3 to save $420/mo";
    savings = 420.0;
    model = "DeepSeek-V3 / Coder";
  } else if (spend > 50) {
    trigger = "BUDGET_PACE_EXCEEDED";
    subject = "🛡️ Dirichlet Auto-Pilot: Prevent budget overruns before end of billing cycle";
    savings = 210.0;
    model = "Groq Llama 3.3 70B";
  }

  return {
    id: `drip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email,
    triggerReason: trigger,
    subject,
    potentialMonthlySavingsUsd: savings,
    simulatedWebhookSent: true,
    recommendedModel: model,
    dispatchedAt: new Date().toISOString()
  };
}
