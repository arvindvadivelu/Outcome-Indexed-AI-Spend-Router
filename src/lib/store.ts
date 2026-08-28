import { create } from "zustand";

export interface LogItem {
  id: string;
  created_at: string;
  model_used: string;
  provider: string;
  task_type: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  cost_inr: number;
  latency_ms: number;
  outcome_success: boolean | null;
  outcome_metric: string;
  prompt_preview: string;
  cached_hit: boolean;
  fallback_triggered: boolean;
  speculative_win?: boolean;
  critic_escalated?: boolean;
  status: string;
}

export interface BenchmarkItem {
  model_name: string;
  provider: string;
  task_type: string;
  total_requests: number;
  success_count: number;
  win_rate: number;
  win_rate_pct: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  cost_per_1k_tokens: number;
  cost_per_outcome_usd: number;
  cost_per_positive_outcome: number;
  pareto_tier: "frontier" | "suboptimal";
  thompson_score: number;
  synthetic_judge_confidence?: number;
  critic_pass_rate?: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  task_type: string;
  condition_pattern: string;
  target_metric: string;
  is_active: boolean;
  enabled: boolean;
  priority_models: string[];
  models_priority: string[];
  fallback_model: string;
  max_latency_ms: number;
  max_cost_usd: number;
  min_win_rate: number;
  strategy: string;
  ai_synthesized?: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  environment: "live" | "test";
  rate_limit: number;
  rate_limit_rpm: number;
  created_at: string;
  last_used_at: string;
  is_active: boolean;
}

export interface AutoPilotState {
  enabled: boolean;
  mode: "optimal_pace" | "aggressive_savings" | "quality_boost";
  burn_ratio: number;
  monthly_budget_usd: number;
  projected_spend_usd: number;
  cost_weight_w2: number;
  quality_weight_w1: number;
}

interface AppState {
  currency: "USD" | "INR";
  setCurrency: (c: "USD" | "INR") => void;
  toggleCurrency: () => void;
  
  // Organization
  orgName: string;
  planTier: string;
  monthlyQuota: number;
  currentTokens: number;
  monthlySpendUSD: number;
  baselineSpendUSD: number;

  // AI Autonomous Subsystems
  autopilot: AutoPilotState;
  setAutopilotMode: (mode: "optimal_pace" | "aggressive_savings" | "quality_boost") => void;
  toggleAutopilot: () => void;

  // Telemetry items
  logs: LogItem[];
  telemetryLogs: LogItem[];
  benchmarks: BenchmarkItem[];
  modelBenchmarks: BenchmarkItem[];
  rules: RoutingRule[];
  routingRules: RoutingRule[];
  apiKeys: ApiKeyItem[];

  // Actions
  recordOutcome: (requestId: string, success: boolean) => void;
  addRule: (rule: RoutingRule) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  updateRulePriority?: (id: string, newPriority: string[]) => void;
  createApiKey: (name: string, envOrLimit?: string | number) => void;
  deleteApiKey: (id: string) => void;
  revokeApiKey: (id: string) => void;
  addLog: (log: LogItem) => void;
}

export const useAppStore = create<AppState>((set) => {
  const initialLogs: LogItem[] = [
    {
      id: "oir_req_998124",
      created_at: "Just now",
      model_used: "claude-3-5-sonnet-20241022",
      provider: "anthropic",
      task_type: "sales_email",
      tokens_in: 340,
      tokens_out: 220,
      cost_usd: 0.00432,
      cost_inr: 0.373,
      latency_ms: 380,
      outcome_success: true,
      outcome_metric: "demo_booked",
      prompt_preview: "Draft personalized cold outreach to VP of Engineering at a FinTech firm...",
      cached_hit: false,
      fallback_triggered: false,
      speculative_win: false,
      critic_escalated: false,
      status: "success"
    },
    {
      id: "oir_req_998123",
      created_at: "2 min ago",
      model_used: "deepseek-coder",
      provider: "deepseek",
      task_type: "code_generation",
      tokens_in: 580,
      tokens_out: 410,
      cost_usd: 0.00065,
      cost_inr: 0.056,
      latency_ms: 120,
      outcome_success: true,
      outcome_metric: "code_merged",
      prompt_preview: "Refactor TypeScript Redis connection pooling and add circuit breaker retry...",
      cached_hit: false,
      fallback_triggered: false,
      speculative_win: true,
      critic_escalated: false,
      status: "success"
    },
    {
      id: "oir_req_998122",
      created_at: "5 min ago",
      model_used: "llama-3.3-70b-versatile",
      provider: "groq",
      task_type: "customer_support",
      tokens_in: 210,
      tokens_out: 95,
      cost_usd: 0.00018,
      cost_inr: 0.015,
      latency_ms: 84,
      outcome_success: true,
      outcome_metric: "ticket_resolved",
      prompt_preview: "Explain how webhook retry exponential backoff works when HTTP 500 happens...",
      cached_hit: true,
      fallback_triggered: false,
      speculative_win: false,
      critic_escalated: false,
      status: "success"
    },
    {
      id: "oir_req_998121",
      created_at: "11 min ago",
      model_used: "gpt-4o-mini",
      provider: "openai",
      task_type: "data_extraction",
      tokens_in: 180,
      tokens_out: 60,
      cost_usd: 0.00021,
      cost_inr: 0.018,
      latency_ms: 190,
      outcome_success: true,
      outcome_metric: "data_verified",
      prompt_preview: "Extract invoice line items and tax amounts from PDF text dump...",
      cached_hit: false,
      fallback_triggered: false,
      speculative_win: false,
      critic_escalated: true,
      status: "success"
    }
  ];

  const initialBenchmarks: BenchmarkItem[] = [
    {
      model_name: "Claude 3.5 Sonnet",
      provider: "anthropic",
      task_type: "Sales Outreach",
      total_requests: 12400,
      success_count: 11580,
      win_rate: 93.4,
      win_rate_pct: 93.4,
      avg_latency_ms: 380,
      avg_cost_usd: 0.0034,
      cost_per_1k_tokens: 0.003,
      cost_per_outcome_usd: 0.00364,
      cost_per_positive_outcome: 0.00364,
      pareto_tier: "frontier",
      thompson_score: 0.892,
      synthetic_judge_confidence: 96.5,
      critic_pass_rate: 98.2
    },
    {
      model_name: "DeepSeek Coder V2",
      provider: "deepseek",
      task_type: "Code Review",
      total_requests: 18900,
      success_count: 17410,
      win_rate: 92.1,
      win_rate_pct: 92.1,
      avg_latency_ms: 310,
      avg_cost_usd: 0.00065,
      cost_per_1k_tokens: 0.0006,
      cost_per_outcome_usd: 0.00071,
      cost_per_positive_outcome: 0.00071,
      pareto_tier: "frontier",
      thompson_score: 0.941,
      synthetic_judge_confidence: 94.0,
      critic_pass_rate: 94.6
    },
    {
      model_name: "Llama 3.3 70B (Groq)",
      provider: "groq",
      task_type: "Support FAQ",
      total_requests: 8400,
      success_count: 8080,
      win_rate: 96.2,
      win_rate_pct: 96.2,
      avg_latency_ms: 84,
      avg_cost_usd: 0.00018,
      cost_per_1k_tokens: 0.0002,
      cost_per_outcome_usd: 0.00019,
      cost_per_positive_outcome: 0.00019,
      pareto_tier: "frontier",
      thompson_score: 0.978,
      synthetic_judge_confidence: 98.1,
      critic_pass_rate: 97.4
    },
    {
      model_name: "DeepSeek-V3",
      provider: "deepseek",
      task_type: "SQL & Extraction",
      total_requests: 15600,
      success_count: 14790,
      win_rate: 94.8,
      win_rate_pct: 94.8,
      avg_latency_ms: 280,
      avg_cost_usd: 0.00042,
      cost_per_1k_tokens: 0.0004,
      cost_per_outcome_usd: 0.00044,
      cost_per_positive_outcome: 0.00044,
      pareto_tier: "frontier",
      thompson_score: 0.956,
      synthetic_judge_confidence: 95.2,
      critic_pass_rate: 96.1
    },
    {
      model_name: "GPT-4o (Vanilla)",
      provider: "openai",
      task_type: "General Flagship",
      total_requests: 2200,
      success_count: 1980,
      win_rate: 90.0,
      win_rate_pct: 90.0,
      avg_latency_ms: 490,
      avg_cost_usd: 0.0052,
      cost_per_1k_tokens: 0.005,
      cost_per_outcome_usd: 0.00577,
      cost_per_positive_outcome: 0.00577,
      pareto_tier: "suboptimal",
      thompson_score: 0.720,
      synthetic_judge_confidence: 92.0,
      critic_pass_rate: 99.0
    }
  ];

  const initialRules: RoutingRule[] = [
    {
      id: "rule_1",
      name: "High-Converting Sales Email Route",
      task_type: "sales_email",
      condition_pattern: "task == 'sales_email' || contains(prompt, 'outreach')",
      target_metric: "demo_booked",
      is_active: true,
      enabled: true,
      priority_models: ["claude-3-5-sonnet", "deepseek-chat", "gpt-4o-mini"],
      models_priority: ["claude-3-5-sonnet", "deepseek-chat", "gpt-4o-mini"],
      fallback_model: "gpt-4o",
      max_latency_ms: 500,
      max_cost_usd: 0.005,
      min_win_rate: 0.90,
      strategy: "outcome_optimized",
      ai_synthesized: false
    },
    {
      id: "rule_2",
      name: "Cost-Optimized Code Review",
      task_type: "code_generation",
      condition_pattern: "task == 'code_generation' || contains(prompt, 'typescript')",
      target_metric: "code_merged",
      is_active: true,
      enabled: true,
      priority_models: ["deepseek-coder", "claude-3-5-sonnet", "gpt-4o-mini"],
      models_priority: ["deepseek-coder", "claude-3-5-sonnet", "gpt-4o-mini"],
      fallback_model: "gpt-4o",
      max_latency_ms: 600,
      max_cost_usd: 0.002,
      min_win_rate: 0.88,
      strategy: "cost_minimum",
      ai_synthesized: false
    },
    {
      id: "rule_3",
      name: "Ultra-Fast Support Triage (<100ms)",
      task_type: "customer_support",
      condition_pattern: "task == 'customer_support'",
      target_metric: "ticket_resolved",
      is_active: true,
      enabled: true,
      priority_models: ["llama-3.3-70b-versatile", "deepseek-chat", "gpt-4o-mini"],
      models_priority: ["llama-3.3-70b-versatile", "deepseek-chat", "gpt-4o-mini"],
      fallback_model: "gpt-4o-mini",
      max_latency_ms: 150,
      max_cost_usd: 0.0005,
      min_win_rate: 0.92,
      strategy: "latency_prioritized",
      ai_synthesized: true
    }
  ];

  const initialApiKeys: ApiKeyItem[] = [
    {
      id: "key_1",
      name: "Production Backend Gateway",
      key_prefix: "oir_live_8f39a7",
      environment: "live",
      rate_limit: 1200,
      rate_limit_rpm: 1200,
      created_at: "Aug 10, 2026",
      last_used_at: "Just now",
      is_active: true
    },
    {
      id: "key_2",
      name: "Staging / Testing Sandbox",
      key_prefix: "oir_test_2b419c",
      environment: "test",
      rate_limit: 300,
      rate_limit_rpm: 300,
      created_at: "Aug 14, 2026",
      last_used_at: "2 hours ago",
      is_active: true
    }
  ];

  return {
    currency: "USD",
    setCurrency: (currency) => set({ currency }),
    toggleCurrency: () => set((state) => ({ currency: state.currency === "USD" ? "INR" : "USD" })),
    
    orgName: "Acme AI Lab",
    planTier: "growth",
    monthlyQuota: 500000,
    currentTokens: 184200,
    monthlySpendUSD: 842.50,
    baselineSpendUSD: 1450.80,

    autopilot: {
      enabled: true,
      mode: "optimal_pace",
      burn_ratio: 0.97,
      monthly_budget_usd: 1500.0,
      projected_spend_usd: 972.10,
      cost_weight_w2: 25.0,
      quality_weight_w1: 0.70
    },

    setAutopilotMode: (mode) =>
      set((state) => ({
        autopilot: {
          ...state.autopilot,
          mode,
          cost_weight_w2: mode === "aggressive_savings" ? 40.0 : (mode === "quality_boost" ? 15.0 : 25.0),
          quality_weight_w1: mode === "aggressive_savings" ? 0.50 : (mode === "quality_boost" ? 0.85 : 0.70)
        }
      })),

    toggleAutopilot: () =>
      set((state) => ({
        autopilot: {
          ...state.autopilot,
          enabled: !state.autopilot.enabled
        }
      })),

    logs: initialLogs,
    telemetryLogs: initialLogs,
    benchmarks: initialBenchmarks,
    modelBenchmarks: initialBenchmarks,
    rules: initialRules,
    routingRules: initialRules,
    apiKeys: initialApiKeys,

    recordOutcome: (requestId: string, success: boolean) =>
      set((state) => {
        const updatedLogs = state.logs.map((l) =>
          l.id === requestId ? { ...l, outcome_success: success } : l
        );
        return { logs: updatedLogs, telemetryLogs: updatedLogs };
      }),

    addRule: (rule: RoutingRule) =>
      set((state) => {
        const updated = [rule, ...state.rules];
        return { rules: updated, routingRules: updated };
      }),

    toggleRule: (id: string) =>
      set((state) => {
        const updated = state.rules.map((r) =>
          r.id === id ? { ...r, is_active: !r.is_active, enabled: !r.enabled } : r
        );
        return { rules: updated, routingRules: updated };
      }),

    deleteRule: (id: string) =>
      set((state) => {
        const updated = state.rules.filter((r) => r.id !== id);
        return { rules: updated, routingRules: updated };
      }),

    updateRulePriority: (id: string, newPriority: string[]) =>
      set((state) => {
        const updated = state.rules.map((r) =>
          r.id === id ? { ...r, priority_models: newPriority, models_priority: newPriority } : r
        );
        return { rules: updated, routingRules: updated };
      }),

    createApiKey: (name: string, envOrLimit?: string | number) =>
      set((state) => {
        const isLive = typeof envOrLimit === "string" ? envOrLimit === "live" : true;
        const prefix = isLive ? "oir_live_" : "oir_test_";
        const randomHex = Math.random().toString(36).substring(2, 8);
        const newKey: ApiKeyItem = {
          id: `key_${Date.now()}`,
          name,
          key_prefix: `${prefix}${randomHex}`,
          environment: isLive ? "live" : "test",
          rate_limit: typeof envOrLimit === "number" ? envOrLimit : 600,
          rate_limit_rpm: typeof envOrLimit === "number" ? envOrLimit : 600,
          created_at: "Just now",
          last_used_at: "Never",
          is_active: true
        };
        return { apiKeys: [newKey, ...state.apiKeys] };
      }),

    deleteApiKey: (id: string) =>
      set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) })),

    revokeApiKey: (id: string) =>
      set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) })),

    addLog: (log: LogItem) =>
      set((state) => {
        const updated = [log, ...state.logs];
        return { logs: updated, telemetryLogs: updated };
      })
  };
});
