import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export interface SlaContractItem {
  id: string;
  requestId: string;
  createdAt: string;
  provider: string;
  model: string;
  latencyLimitMs: number;
  actualLatencyMs: number;
  status: "settled_fulfilled" | "breached_escrow_refunded";
  refundUsd: number;
  refundTokens: number;
  cryptographicHash: string;
}

export interface PrewarmMetrics {
  totalEvents: number;
  speculativeHits: number;
  hitRatePct: number;
  baselineTtftMs: number;
  acceleratedTtftMs: number;
  reductionPct: number;
  activeHotSlots: number;
}

export interface DeltaCompressionStats {
  totalTokensAvoided: number;
  compressionRatioPct: number;
  costSavedUsd: number;
}

export interface FederationSettings {
  enabled: boolean;
  weight: number;
  totalTenants: number;
  epsilon: number;
}

export interface WebhookConfig {
  endpointUrl: string;
  secretKey: string;
  events: string[];
}

interface AppState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  currency: "USD" | "INR";
  setCurrency: (c: "USD" | "INR") => void;
  toggleCurrency: () => void;

  // Authentication State
  user: {
    name: string;
    email: string;
    hasPin: boolean;
    hasBiometrics: boolean;
  } | null;
  setAuthUser: (user: { name: string; email: string; hasPin: boolean; hasBiometrics: boolean } | null) => void;
  logout: () => void;
  
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

  // 4 Breakthrough Strategic Features State
  prewarmMetrics: PrewarmMetrics;
  slaEscrowContracts: SlaContractItem[];
  deltaStats: DeltaCompressionStats;
  federationSettings: FederationSettings;
  setFederationWeight: (weight: number) => void;
  toggleFederation: () => void;
  addSlaContract: (contract: SlaContractItem) => void;

  // Webhook Persistent Config
  webhookConfig: WebhookConfig;
  setWebhookConfig: (config: Partial<WebhookConfig>) => void;

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
  clearUserData: () => void;
}

const DEFAULT_BENCHMARKS: BenchmarkItem[] = [
  {
    model_name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    task_type: "sales_email",
    total_requests: 18420,
    success_count: 17020,
    win_rate: 0.924,
    win_rate_pct: 92.4,
    avg_latency_ms: 380,
    avg_cost_usd: 0.0034,
    cost_per_1k_tokens: 0.003,
    cost_per_outcome_usd: 0.00368,
    cost_per_positive_outcome: 0.00368,
    pareto_tier: "frontier",
    thompson_score: 0.942,
    synthetic_judge_confidence: 0.96,
    critic_pass_rate: 0.98
  },
  {
    model_name: "DeepSeek Coder",
    provider: "deepseek",
    task_type: "code_generation",
    total_requests: 14280,
    success_count: 13150,
    win_rate: 0.921,
    win_rate_pct: 92.1,
    avg_latency_ms: 115,
    avg_cost_usd: 0.00065,
    cost_per_1k_tokens: 0.0006,
    cost_per_outcome_usd: 0.00071,
    cost_per_positive_outcome: 0.00071,
    pareto_tier: "frontier",
    thompson_score: 0.938,
    synthetic_judge_confidence: 0.94,
    critic_pass_rate: 0.95
  },
  {
    model_name: "Groq Llama 3.3 70B",
    provider: "groq",
    task_type: "customer_support",
    total_requests: 21500,
    success_count: 20600,
    win_rate: 0.958,
    win_rate_pct: 95.8,
    avg_latency_ms: 84,
    avg_cost_usd: 0.00018,
    cost_per_1k_tokens: 0.0002,
    cost_per_outcome_usd: 0.00019,
    cost_per_positive_outcome: 0.00019,
    pareto_tier: "frontier",
    thompson_score: 0.965,
    synthetic_judge_confidence: 0.98,
    critic_pass_rate: 0.99
  },
  {
    model_name: "DeepSeek-V3",
    provider: "deepseek",
    task_type: "general_instruction",
    total_requests: 31200,
    success_count: 27980,
    win_rate: 0.897,
    win_rate_pct: 89.7,
    avg_latency_ms: 95,
    avg_cost_usd: 0.00042,
    cost_per_1k_tokens: 0.0004,
    cost_per_outcome_usd: 0.00047,
    cost_per_positive_outcome: 0.00047,
    pareto_tier: "frontier",
    thompson_score: 0.912,
    synthetic_judge_confidence: 0.93,
    critic_pass_rate: 0.94
  },
  {
    model_name: "GPT-4o",
    provider: "openai",
    task_type: "complex_reasoning",
    total_requests: 12400,
    success_count: 10450,
    win_rate: 0.842,
    win_rate_pct: 84.2,
    avg_latency_ms: 680,
    avg_cost_usd: 0.0052,
    cost_per_1k_tokens: 0.005,
    cost_per_outcome_usd: 0.00618,
    cost_per_positive_outcome: 0.00618,
    pareto_tier: "suboptimal",
    thompson_score: 0.835,
    synthetic_judge_confidence: 0.88,
    critic_pass_rate: 0.91
  }
];

const DEFAULT_RULES: RoutingRule[] = [
  {
    id: "rule_1",
    name: "Sales Outreach: High Conversion",
    task_type: "sales_email",
    condition_pattern: "task == 'sales_email'",
    target_metric: "demo_booked",
    is_active: true,
    enabled: true,
    priority_models: ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
    models_priority: ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
    fallback_model: "GPT-4o",
    max_latency_ms: 450,
    max_cost_usd: 0.0035,
    min_win_rate: 0.90,
    strategy: "outcome_optimized"
  },
  {
    id: "rule_2",
    name: "Code Generation & PR Review",
    task_type: "code_generation",
    condition_pattern: "task == 'code_generation'",
    target_metric: "code_merged",
    is_active: true,
    enabled: true,
    priority_models: ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"],
    models_priority: ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"],
    fallback_model: "GPT-4o",
    max_latency_ms: 400,
    max_cost_usd: 0.002,
    min_win_rate: 0.88,
    strategy: "cost_minimum"
  }
];

const DEFAULT_KEYS: ApiKeyItem[] = [
  {
    id: "key_1",
    name: "Production Gateway Key",
    key_prefix: "oir_live_8f9a2b",
    environment: "live",
    rate_limit: 600,
    rate_limit_rpm: 600,
    created_at: "Just now",
    last_used_at: "Just now",
    is_active: true
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const nextTheme = state.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            if (nextTheme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          return { theme: nextTheme };
        }),

      currency: "USD",
      setCurrency: (currency) => set({ currency }),
      toggleCurrency: () => set((state) => ({ currency: state.currency === "USD" ? "INR" : "USD" })),
      
      // Auth State
      user: {
        name: "Alex Vance",
        email: "alex@company.com",
        hasPin: true,
        hasBiometrics: true
      },
      setAuthUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      orgName: "Acme AI Lab",
      planTier: "growth",
      monthlyQuota: 500000,
      currentTokens: 0,
      monthlySpendUSD: 0.00,
      baselineSpendUSD: 0.00,

      autopilot: {
        enabled: true,
        mode: "optimal_pace",
        burn_ratio: 0.00,
        monthly_budget_usd: 1500.0,
        projected_spend_usd: 0.00,
        cost_weight_w2: 25.0,
        quality_weight_w1: 0.70
      },

      prewarmMetrics: {
        totalEvents: 1420,
        speculativeHits: 1294,
        hitRatePct: 91.1,
        baselineTtftMs: 280.0,
        acceleratedTtftMs: 68.4,
        reductionPct: 75.6,
        activeHotSlots: 4
      },

      slaEscrowContracts: [],

      deltaStats: {
        totalTokensAvoided: 512400,
        compressionRatioPct: 60.3,
        costSavedUsd: 17.93
      },

      federationSettings: {
        enabled: true,
        weight: 0.75,
        totalTenants: 480,
        epsilon: 0.5
      },

      webhookConfig: {
        endpointUrl: "https://api.acme.ai/webhooks/outcome-events",
        secretKey: "whsec_99a8b7c6d5e4f3a2b1",
        events: ["outcome.indexed.success", "sla.breach.escrow_refunded", "autopilot.weight_adjusted"]
      },

      setWebhookConfig: (config) =>
        set((state) => ({
          webhookConfig: { ...state.webhookConfig, ...config }
        })),

      setFederationWeight: (weight: number) =>
        set((state) => ({
          federationSettings: { ...state.federationSettings, weight }
        })),

      toggleFederation: () =>
        set((state) => ({
          federationSettings: { ...state.federationSettings, enabled: !state.federationSettings.enabled }
        })),

      addSlaContract: (contract: SlaContractItem) =>
        set((state) => ({
          slaEscrowContracts: [contract, ...state.slaEscrowContracts]
        })),

      setAutopilotMode: (mode) =>
        set((state) => ({
          autopilot: {
            ...state.autopilot,
            mode,
            cost_weight_w2: mode === "aggressive_savings" ? 40.0 : mode === "quality_boost" ? 15.0 : 25.0,
            quality_weight_w1: mode === "aggressive_savings" ? 0.50 : mode === "quality_boost" ? 0.85 : 0.70
          }
        })),

      toggleAutopilot: () =>
        set((state) => ({
          autopilot: { ...state.autopilot, enabled: !state.autopilot.enabled }
        })),

      logs: [],
      telemetryLogs: [],
      benchmarks: DEFAULT_BENCHMARKS,
      modelBenchmarks: DEFAULT_BENCHMARKS,
      rules: DEFAULT_RULES,
      routingRules: DEFAULT_RULES,
      apiKeys: DEFAULT_KEYS,

      recordOutcome: (requestId: string, success: boolean) =>
        set((state) => {
          const updatedLogs = (state.logs.length > 0 ? state.logs : state.telemetryLogs).map((log) => {
            if (log.id === requestId) {
              return { ...log, outcome_success: success };
            }
            return log;
          });

          return {
            logs: updatedLogs,
            telemetryLogs: updatedLogs
          };
        }),

      addRule: (rule: RoutingRule) =>
        set((state) => {
          const updated = [rule, ...state.routingRules];
          return { rules: updated, routingRules: updated };
        }),

      toggleRule: (id: string) =>
        set((state) => {
          const updated = state.routingRules.map((r) =>
            r.id === id ? { ...r, is_active: !r.is_active, enabled: !r.enabled } : r
          );
          return { rules: updated, routingRules: updated };
        }),

      deleteRule: (id: string) =>
        set((state) => {
          const updated = state.routingRules.filter((r) => r.id !== id);
          return { rules: updated, routingRules: updated };
        }),

      createApiKey: (name: string, envOrLimit: string | number = "live") =>
        set((state) => {
          const env = typeof envOrLimit === "string" ? (envOrLimit as "live" | "test") : "live";
          const rateLimit = typeof envOrLimit === "number" ? envOrLimit : 600;
          const newKey: ApiKeyItem = {
            id: `key_${Date.now()}`,
            name,
            key_prefix: `oir_${env}_${Math.random().toString(36).substring(2, 8)}`,
            environment: env,
            rate_limit: rateLimit,
            rate_limit_rpm: rateLimit,
            created_at: "Just now",
            last_used_at: "Never",
            is_active: true
          };
          const updated = [newKey, ...state.apiKeys];
          return { apiKeys: updated };
        }),

      deleteApiKey: (id: string) =>
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.id !== id)
        })),

      revokeApiKey: (id: string) =>
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.id !== id)
        })),

      addLog: (log: LogItem) =>
        set((state) => {
          const currentSpend = state.monthlySpendUSD + log.cost_usd;
          const baselineCost = log.cost_usd * 1.74; // vs GPT-4o unrouted
          const currentBaseline = state.baselineSpendUSD + baselineCost;
          const totalTokens = state.currentTokens + log.tokens_in + log.tokens_out;
          const updatedLogs = [log, ...state.logs];

          return {
            logs: updatedLogs,
            telemetryLogs: updatedLogs,
            monthlySpendUSD: parseFloat(currentSpend.toFixed(4)),
            baselineSpendUSD: parseFloat(currentBaseline.toFixed(4)),
            currentTokens: totalTokens
          };
        }),

      clearUserData: () =>
        set(() => ({
          logs: [],
          telemetryLogs: [],
          monthlySpendUSD: 0.00,
          baselineSpendUSD: 0.00,
          currentTokens: 0,
          slaEscrowContracts: []
        }))
    }),
    {
      name: "outcome_router_storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as any))),
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        user: state.user,
        monthlySpendUSD: state.monthlySpendUSD,
        baselineSpendUSD: state.baselineSpendUSD,
        currentTokens: state.currentTokens,
        logs: state.logs,
        telemetryLogs: state.telemetryLogs,
        rules: state.rules,
        routingRules: state.routingRules,
        apiKeys: state.apiKeys,
        slaEscrowContracts: state.slaEscrowContracts,
        deltaStats: state.deltaStats,
        federationSettings: state.federationSettings,
        autopilot: state.autopilot,
        webhookConfig: state.webhookConfig
      })
    }
  )
);
