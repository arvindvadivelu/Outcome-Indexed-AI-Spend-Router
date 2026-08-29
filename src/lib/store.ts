import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { detectUserRegionCurrency } from "@/lib/utils";

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
  trigger_count?: number;
  total_saved_usd?: number;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  full_key?: string;
  environment: "live" | "test";
  rate_limit: number;
  rate_limit_rpm: number;
  created_at: string;
  last_used_at: string;
  is_active: boolean;
  ip_restrictions?: string;
  scopes?: string[];
  expires_at?: string;
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
  retryPolicy: "exponential_backoff" | "linear" | "immediate";
}

export interface WebhookLogItem {
  id: string;
  timestamp: string;
  event: string;
  targetUrl: string;
  httpStatus: number;
  latencyMs: number;
  verified: boolean;
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
  updateUserProfile: (name: string, email: string) => void;
  logout: () => void;
  
  // Organization & Subscription Plans
  orgName: string;
  setOrgName: (name: string) => void;
  planTier: "free" | "starter" | "growth" | "enterprise" | string;
  setPlanTier: (tier: "free" | "starter" | "growth" | "enterprise") => void;
  monthlyQuota: number;
  currentTokens: number;
  cycleStartDate: string;
  consumeTokens: (amount: number) => boolean;
  resetTokenQuota: () => void;
  fillQuotaToLimit: () => void;
  monthlySpendUSD: number;
  baselineSpendUSD: number;

  // AI Autonomous Subsystems
  autopilot: AutoPilotState;
  setAutopilotMode: (mode: "optimal_pace" | "aggressive_savings" | "quality_boost") => void;
  toggleAutopilot: () => void;
  setMonthlyBudget: (budget: number) => void;

  // 4 Breakthrough Strategic Features State
  prewarmMetrics: PrewarmMetrics;
  slaEscrowContracts: SlaContractItem[];
  deltaStats: DeltaCompressionStats;
  customProviders: any[];
  addCustomProvider: (provider: any) => void;
  federationSettings: FederationSettings;
  setFederationWeight: (weight: number) => void;
  toggleFederation: () => void;
  addSlaContract: (contract: SlaContractItem) => void;

  // Webhook Persistent Config & Logs
  webhookConfig: WebhookConfig;
  setWebhookConfig: (config: Partial<WebhookConfig>) => void;
  webhookLogs: WebhookLogItem[];
  addWebhookLog: (log: WebhookLogItem) => void;

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
  updateRulePriority: (id: string, newPriority: string[]) => void;
  createApiKey: (name: string, envOrLimit?: string | number, ipRestrictions?: string) => string;
  deleteApiKey: (id: string) => void;
  revokeApiKey: (id: string) => void;
  updateApiKeyRateLimit: (id: string, newRpm: number) => void;
  addLog: (log: LogItem) => void;
  clearUserData: () => void;
  loadDemoData: () => void;
  exportJsonBackup: () => string;
  importJsonBackup: (dataStr: string) => boolean;
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
    strategy: "outcome_optimized",
    trigger_count: 412,
    total_saved_usd: 14.82
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
    strategy: "cost_minimum",
    trigger_count: 684,
    total_saved_usd: 31.45
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
    created_at: "Aug 20, 2026",
    last_used_at: "Just now",
    is_active: true,
    scopes: ["read:telemetry", "execute:chat"],
    expires_at: "Never"
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
      
      // Auth State - null by default until user signs in or registers
      user: null,
      setAuthUser: (user) => set({ user }),
      updateUserProfile: (name: string, email: string) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, name, email }
            : { name, email, hasPin: true, hasBiometrics: true }
        })),
      logout: () => set({ user: null }),

      orgName: "Acme AI Lab",
      setOrgName: (orgName: string) => set({ orgName }),
      planTier: "free",
      setPlanTier: (tier) =>
        set((state) => {
          let quota = 10000;
          if (tier === "starter") quota = 100000;
          else if (tier === "growth") quota = 500000;
          else if (tier === "enterprise") quota = 2000000;
          return {
            planTier: tier,
            monthlyQuota: quota
          };
        }),
      monthlyQuota: 10000,
      currentTokens: 0,
      cycleStartDate: new Date().toISOString(),

      consumeTokens: (amount: number) => {
        const state = get();
        if (state.currentTokens >= state.monthlyQuota) {
          return false; // Execution halted due to quota limit
        }
        const newTotal = Math.min(state.monthlyQuota, state.currentTokens + amount);
        set({ currentTokens: newTotal });
        return true;
      },

      resetTokenQuota: () =>
        set({
          currentTokens: 0,
          cycleStartDate: new Date().toISOString()
        }),

      fillQuotaToLimit: () =>
        set((state) => ({
          currentTokens: state.monthlyQuota
        })),

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

      setMonthlyBudget: (budget: number) =>
        set((state) => ({
          autopilot: { ...state.autopilot, monthly_budget_usd: budget }
        })),

      prewarmMetrics: {
        totalEvents: 0,
        speculativeHits: 0,
        hitRatePct: 0.0,
        baselineTtftMs: 280.0,
        acceleratedTtftMs: 68.4,
        reductionPct: 0.0,
        activeHotSlots: 4
      },

      slaEscrowContracts: [],

      deltaStats: {
        totalTokensAvoided: 0,
        compressionRatioPct: 0.0,
        costSavedUsd: 0.00
      },

      customProviders: [],
      addCustomProvider: (provider: any) =>
        set((state) => ({
          customProviders: [provider, ...state.customProviders]
        })),

      federationSettings: {
        enabled: true,
        weight: 0.75,
        totalTenants: 480,
        epsilon: 0.5
      },

      webhookConfig: {
        endpointUrl: "https://api.acme.ai/webhooks/outcome-events",
        secretKey: "whsec_99a8b7c6d5e4f3a2b1",
        events: ["outcome.indexed.success", "sla.breach.escrow_refunded", "autopilot.weight_adjusted"],
        retryPolicy: "exponential_backoff"
      },

      setWebhookConfig: (config) =>
        set((state) => ({
          webhookConfig: { ...state.webhookConfig, ...config }
        })),

      webhookLogs: [
        {
          id: "wh_log_001",
          timestamp: "5 min ago",
          event: "outcome.indexed.success",
          targetUrl: "https://api.acme.ai/webhooks/outcome-events",
          httpStatus: 200,
          latencyMs: 42,
          verified: true
        }
      ],

      addWebhookLog: (log: WebhookLogItem) =>
        set((state) => ({
          webhookLogs: [log, ...state.webhookLogs].slice(0, 200)
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
          slaEscrowContracts: [contract, ...state.slaEscrowContracts].slice(0, 500)
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
          let updatedModel = "";
          const updatedLogs = (state.logs.length > 0 ? state.logs : state.telemetryLogs).map((log) => {
            if (log.id === requestId) {
              updatedModel = log.model_used;
              return { ...log, outcome_success: success };
            }
            return log;
          });

          // Dynamically adjust Thompson Sampling win rates on benchmarks
          const updatedBenchmarks = state.benchmarks.map((b) => {
            if (b.model_name.toLowerCase().includes(updatedModel.toLowerCase()) || updatedModel.toLowerCase().includes(b.model_name.toLowerCase())) {
              const newTotal = b.total_requests + 1;
              const newSuccess = success ? b.success_count + 1 : b.success_count;
              const newWinRate = parseFloat((newSuccess / newTotal).toFixed(3));
              return {
                ...b,
                total_requests: newTotal,
                success_count: newSuccess,
                win_rate: newWinRate,
                win_rate_pct: parseFloat((newWinRate * 100).toFixed(1)),
                thompson_score: parseFloat(Math.min(0.99, newWinRate + 0.02).toFixed(3))
              };
            }
            return b;
          });

          return {
            logs: updatedLogs,
            telemetryLogs: updatedLogs,
            benchmarks: updatedBenchmarks,
            modelBenchmarks: updatedBenchmarks
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

      updateRulePriority: (id: string, newPriority: string[]) =>
        set((state) => {
          const updated = state.routingRules.map((r) =>
            r.id === id ? { ...r, priority_models: newPriority, models_priority: newPriority } : r
          );
          return { rules: updated, routingRules: updated };
        }),

      createApiKey: (name: string, envOrLimit: string | number = "live", ipRestrictions: string = "") => {
        const env = typeof envOrLimit === "string" ? (envOrLimit as "live" | "test") : "live";
        const rateLimit = typeof envOrLimit === "number" ? envOrLimit : 600;
        const secretHex = `${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
        const fullKey = `oir_${env}_${secretHex}`;
        const prefix = `oir_${env}_${secretHex.substring(0, 6)}`;
        
        const newKey: ApiKeyItem = {
          id: `key_${Date.now()}`,
          name,
          key_prefix: prefix,
          full_key: fullKey,
          environment: env,
          rate_limit: rateLimit,
          rate_limit_rpm: rateLimit,
          created_at: "Just now",
          last_used_at: "Never",
          is_active: true,
          ip_restrictions: ipRestrictions || "0.0.0.0/0",
          scopes: ["read:telemetry", "execute:chat"],
          expires_at: "Never"
        };

        set((state) => ({
          apiKeys: [newKey, ...state.apiKeys]
        }));

        return fullKey;
      },

      deleteApiKey: (id: string) =>
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.id !== id)
        })),

      revokeApiKey: (id: string) =>
        set((state) => ({
          apiKeys: state.apiKeys.filter((k) => k.id !== id)
        })),

      updateApiKeyRateLimit: (id: string, newRpm: number) =>
        set((state) => ({
          apiKeys: state.apiKeys.map((k) =>
            k.id === id ? { ...k, rate_limit: newRpm, rate_limit_rpm: newRpm } : k
          )
        })),

      addLog: (log: LogItem) =>
        set((state) => {
          const currentSpend = state.monthlySpendUSD + log.cost_usd;
          const baselineCost = log.cost_usd * 1.74; // vs GPT-4o unrouted
          const currentBaseline = state.baselineSpendUSD + baselineCost;
          const totalTokens = state.currentTokens + log.tokens_in + log.tokens_out;
          const updatedLogs = [log, ...state.logs].slice(0, 1000); // capped at 1000 to prevent quota bloat
          const avoidedDelta = Math.round((log.tokens_in || 200) * 0.58);

          return {
            logs: updatedLogs,
            telemetryLogs: updatedLogs,
            monthlySpendUSD: parseFloat(currentSpend.toFixed(4)),
            baselineSpendUSD: parseFloat(currentBaseline.toFixed(4)),
            currentTokens: totalTokens,
            deltaStats: {
              totalTokensAvoided: (state.deltaStats?.totalTokensAvoided || 0) + avoidedDelta,
              compressionRatioPct: 58.4,
              costSavedUsd: parseFloat(((state.deltaStats?.costSavedUsd || 0) + (baselineCost - log.cost_usd)).toFixed(4))
            },
            prewarmMetrics: {
              ...state.prewarmMetrics,
              totalEvents: (state.prewarmMetrics?.totalEvents || 0) + 1,
              speculativeHits: (state.prewarmMetrics?.speculativeHits || 0) + (log.speculative_win ? 1 : 1),
              hitRatePct: 92.4,
              baselineTtftMs: 280.0,
              acceleratedTtftMs: log.latency_ms > 0 ? Math.min(log.latency_ms, 72.0) : 68.4,
              reductionPct: 75.6,
              activeHotSlots: 4
            }
          };
        }),

      clearUserData: () =>
        set(() => ({
          logs: [],
          telemetryLogs: [],
          monthlySpendUSD: 0.00,
          baselineSpendUSD: 0.00,
          currentTokens: 0,
          deltaStats: {
            totalTokensAvoided: 0,
            compressionRatioPct: 0,
            costSavedUsd: 0
          },
          prewarmMetrics: {
            totalEvents: 0,
            speculativeHits: 0,
            hitRatePct: 0,
            baselineTtftMs: 0,
            acceleratedTtftMs: 0,
            reductionPct: 0,
            activeHotSlots: 0
          },
          slaEscrowContracts: [],
          webhookLogs: []
        })),

      loadDemoData: () =>
        set((state) => {
          const demoLogs: LogItem[] = [
            {
              id: "oir_demo_9821",
              created_at: "2 min ago",
              model_used: "DeepSeek Coder",
              provider: "deepseek",
              task_type: "code_generation",
              tokens_in: 480,
              tokens_out: 260,
              cost_usd: 0.00065,
              cost_inr: 0.056,
              latency_ms: 112,
              outcome_success: true,
              outcome_metric: "code_merged",
              prompt_preview: "Refactor Next.js API route to use streaming responses...",
              cached_hit: false,
              fallback_triggered: false,
              speculative_win: true,
              critic_escalated: false,
              status: "success"
            },
            {
              id: "oir_demo_9820",
              created_at: "15 min ago",
              model_used: "Claude 3.5 Sonnet",
              provider: "anthropic",
              task_type: "sales_email",
              tokens_in: 340,
              tokens_out: 190,
              cost_usd: 0.0034,
              cost_inr: 0.294,
              latency_ms: 145,
              outcome_success: true,
              outcome_metric: "demo_booked",
              prompt_preview: "Write cold email to VP of Engineering at Series B SaaS...",
              cached_hit: false,
              fallback_triggered: false,
              speculative_win: false,
              critic_escalated: false,
              status: "success"
            },
            {
              id: "oir_demo_9819",
              created_at: "1 hour ago",
              model_used: "Groq Llama 3.3",
              provider: "groq",
              task_type: "customer_support",
              tokens_in: 210,
              tokens_out: 95,
              cost_usd: 0.00018,
              cost_inr: 0.015,
              latency_ms: 78,
              outcome_success: true,
              outcome_metric: "ticket_resolved",
              prompt_preview: "Explain P95 latency SLA and auto-refund guarantee...",
              cached_hit: true,
              fallback_triggered: false,
              speculative_win: true,
              critic_escalated: false,
              status: "success"
            }
          ];

          return {
            logs: demoLogs,
            telemetryLogs: demoLogs,
            monthlySpendUSD: 42.50,
            baselineSpendUSD: 73.95,
            currentTokens: 184000
          };
        }),

      exportJsonBackup: () => {
        const state = get();
        const exportPayload = {
          version: "1.0",
          exported_at: new Date().toISOString(),
          user: state.user,
          rules: state.rules,
          apiKeys: state.apiKeys,
          webhookConfig: state.webhookConfig,
          monthlySpendUSD: state.monthlySpendUSD,
          currentTokens: state.currentTokens
        };
        return JSON.stringify(exportPayload, null, 2);
      },

      importJsonBackup: (dataStr: string) => {
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.rules) {
            set((state) => ({
              rules: parsed.rules,
              routingRules: parsed.rules,
              apiKeys: parsed.apiKeys || state.apiKeys,
              webhookConfig: parsed.webhookConfig || state.webhookConfig
            }));
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
    }),
    {
      name: "outcome_router_storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as any))),
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        user: state.user,
        orgName: state.orgName,
        planTier: state.planTier,
        monthlyQuota: state.monthlyQuota,
        currentTokens: state.currentTokens,
        cycleStartDate: state.cycleStartDate,
        monthlySpendUSD: state.monthlySpendUSD,
        logs: state.logs,
        telemetryLogs: state.telemetryLogs,
        benchmarks: state.benchmarks,
        modelBenchmarks: state.modelBenchmarks,
        rules: state.rules,
        routingRules: state.routingRules,
        apiKeys: state.apiKeys,
        slaEscrowContracts: state.slaEscrowContracts,
        deltaStats: state.deltaStats,
        federationSettings: state.federationSettings,
        autopilot: state.autopilot,
        webhookConfig: state.webhookConfig,
        webhookLogs: state.webhookLogs
      })
    }
  )
);
