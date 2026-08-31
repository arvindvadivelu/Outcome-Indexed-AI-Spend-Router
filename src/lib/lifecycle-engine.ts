/**
 * 📈 User Onboarding Lifecycle & Activation Milestone Engine
 * Calculates user onboarding velocity, milestones reached, and retention nudges.
 */

export interface OnboardingMilestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  actionUrl: string;
}

export interface LifecycleFunnelReport {
  userEmail: string;
  completionRatePct: number;
  totalMilestones: number;
  completedMilestones: number;
  currentLifecycleStage: "ACTIVATION" | "ONBOARDING" | "SCALING" | "POWER_USER";
  nextRecommendedAction: string;
  milestones: OnboardingMilestone[];
}

export function evaluateUserLifecycle(user: any): LifecycleFunnelReport {
  const hasKey = user?.apiKeys && Array.isArray(user.apiKeys) && user.apiKeys.length > 0;
  const hasRules = user?.rules && Array.isArray(user.rules) && user.rules.length > 0;
  const hasLogs = user?.logs && Array.isArray(user.logs) && user.logs.length > 0;
  const isPaid = user?.plan_tier && user.plan_tier !== "free";

  const milestones: OnboardingMilestone[] = [
    {
      id: "m1_account_setup",
      title: "Account Created & Security PIN Configured",
      description: "Initial tenant workspace provisioned with 6-digit security PIN.",
      completed: true,
      completedAt: user?.created_at || new Date().toISOString(),
      actionUrl: "/app/dashboard"
    },
    {
      id: "m2_key_generation",
      title: "Provision Live Ingress API Key",
      description: "Generate active oir_live key with IP restriction policy.",
      completed: !!hasKey,
      completedAt: hasKey ? user.apiKeys[0]?.created_at : undefined,
      actionUrl: "/app/settings/api-keys"
    },
    {
      id: "m3_policy_synthesis",
      title: "Synthesize Natural Language Routing Policy",
      description: "Define custom prompt-to-model cost and quality bounds.",
      completed: !!hasRules,
      actionUrl: "/app/routing"
    },
    {
      id: "m4_inference_call",
      title: "Execute First Outcome-Indexed Wire Inference",
      description: "Dispatch SDK request through /v1/chat/completions drop-in proxy.",
      completed: !!hasLogs,
      actionUrl: "/docs"
    },
    {
      id: "m5_plan_upgrade",
      title: "Unlock Growth / Enterprise Dirichlet Governor",
      description: "Upgrade plan tier to access 1.82x speculative pre-warming & SLA auto-refunds.",
      completed: isPaid,
      actionUrl: "/app/billing"
    }
  ];

  const completedCount = milestones.filter((m) => m.completed).length;
  const completionRate = Math.round((completedCount / milestones.length) * 100);

  let stage: LifecycleFunnelReport["currentLifecycleStage"] = "ACTIVATION";
  let nextAction = "Generate your first live API key in Settings.";

  if (completedCount >= 5) {
    stage = "POWER_USER";
    nextAction = "Explore Bayesian federated priors in /app/routing to maximize global cost savings.";
  } else if (completedCount >= 4) {
    stage = "SCALING";
    nextAction = "Enable Dirichlet budget auto-pilot in Billing to guarantee zero budget overruns.";
  } else if (completedCount >= 2) {
    stage = "ONBOARDING";
    nextAction = "Synthesize an SDR sales email or code generation routing rule in /app/routing.";
  }

  return {
    userEmail: user?.email || "user@example.com",
    completionRatePct: completionRate,
    totalMilestones: milestones.length,
    completedMilestones: completedCount,
    currentLifecycleStage: stage,
    nextRecommendedAction: nextAction,
    milestones
  };
}
