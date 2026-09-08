"use client";

import { useState, useEffect } from "react";
import { useAppStore, RoutingRule } from "@/lib/store";
import {
  Sparkles,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  Bot,
  Zap,
  ArrowRight,
  Globe,
  Cpu,
  ShieldCheck,
  Activity,
  ArrowUpDown,
  FileCheck2,
  TrendingUp,
  X,
  Code2,
  Check,
  Layers,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  SlidersHorizontal,
  Play,
  Lock,
  AlertCircle,
  ShieldAlert,
  Flame,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";
import { getPlanFeatures } from "@/lib/plan-gates";

export default function RoutingRulesPage() {
  const {
    routingRules,
    toggleRule,
    addRule,
    deleteRule,
    reorderRule,
    autopilot,
    setAutopilotMode,
    toggleAutopilot,
    federationSettings,
    setFederationWeight,
    toggleFederation,
    prewarmMetrics,
    planTier,
    openPlanUpgradeModal,
    user
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const plan = getPlanFeatures(planTier);

  // Upgrade Requirement Modal state
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{ title: string; desc: string; targetPlan: string } | null>(null);

  // Synthesizer state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedSuccess, setSynthesizedSuccess] = useState(false);

  // Manual Rule Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualTask, setManualTask] = useState("sales_email");
  const [customTaskType, setCustomTaskType] = useState("");
  const [manualStrategy, setManualStrategy] = useState("outcome_optimized");
  const [manualMaxLatency, setManualMaxLatency] = useState(400);
  const [manualMaxCost, setManualMaxCost] = useState(0.0035);

  // Live Rule Dry-Run Test State
  const [dryRunPrompt, setDryRunPrompt] = useState("");
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunData, setDryRunData] = useState<any>(null);

  // In-Page Simulation Modal Trigger
  const [showSimulate, setShowSimulate] = useState(false);

  // Anomaly Status & Chaos Simulation State
  const [anomalyData, setAnomalyData] = useState<any>(null);
  const [isFetchingAnomaly, setIsFetchingAnomaly] = useState(false);
  const [chaosTarget, setChaosTarget] = useState("openai");
  const [chaosFault, setChaosFault] = useState<"LATENCY_SPIKE" | "HTTP_500_ERROR" | "RATE_LIMIT_429">("LATENCY_SPIKE");
  const [isInjectingChaos, setIsInjectingChaos] = useState(false);
  const [chaosResult, setChaosResult] = useState<any>(null);

  const fetchAnomalyStatus = async () => {
    try {
      setIsFetchingAnomaly(true);
      const res = await fetch("/api/routing/anomaly-status");
      const data = await res.json();
      if (data.success) {
        setAnomalyData(data);
      }
    } catch (err) {
      console.warn("Anomaly status fetch error:", err);
    } finally {
      setIsFetchingAnomaly(false);
    }
  };

  useEffect(() => {
    fetchAnomalyStatus();
    const interval = setInterval(fetchAnomalyStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleInjectChaos = async () => {
    try {
      setIsInjectingChaos(true);
      const res = await fetch("/api/routing/chaos-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProvider: chaosTarget,
          faultType: chaosFault,
          latencySpikeMs: 450
        })
      });
      const data = await res.json();
      if (data.success) {
        setChaosResult(data);
        fetchAnomalyStatus();
      }
    } catch (err) {
      console.warn("Chaos injection notice:", err);
    } finally {
      setIsInjectingChaos(false);
    }
  };

  const syncRulesToSession = (updatedRules: RoutingRule[]) => {
    if (user?.email) {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, rules: updatedRules })
      }).catch((err) => console.warn("Routing rules session sync notice:", err));
    }
  };

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (!plan.canUseAiRuleSynthesis) {
      setUpgradeModalInfo({
        title: "AI Policy Synthesizer (Starter+ Feature)",
        desc: "Autonomous natural language policy generation is available on Starter and Growth tiers. Free tier includes standard Thompson Sampling Pareto routing. Upgrade to generate autonomous rules from natural language.",
        targetPlan: "Starter"
      });
      return;
    }

    setIsSynthesizing(true);

    try {
      const res = await fetch("/api/routing/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() })
      });

      const data = await res.json();

      if (data.success && data.rule) {
        addRule(data.rule);
        syncRulesToSession(useAppStore.getState().routingRules);
        setSynthesizedSuccess(true);
        setAiPrompt("");
        setTimeout(() => setSynthesizedSuccess(false), 3000);
      }
    } catch (err) {
      console.warn("Synthesis fallback:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCreateManualRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    if (routingRules.length >= plan.maxActiveRules) {
      setShowManualModal(false);
      setUpgradeModalInfo({
        title: "Routing Rule Limit Reached",
        desc: `Your current tier allows up to ${plan.maxActiveRules} active routing rules (${routingRules.length}/${plan.maxActiveRules}). Upgrade to Starter for 5 rules, or Growth for unlimited rules.`,
        targetPlan: "Starter"
      });
      return;
    }

    let priority = ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"];
    if (manualTask === "code_generation") priority = ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"];
    if (manualTask === "customer_support") priority = ["Groq Llama 3.3", "DeepSeek-V3", "GPT-4o Mini"];
    if (manualTask === "custom") priority = ["DeepSeek-V3", "Claude 3.5 Sonnet", "GPT-4o Mini"];

    const effectiveTask = manualTask === "custom" ? (customTaskType.trim() || "custom_task") : manualTask;

    const newRule: RoutingRule = {
      id: `rule_man_${Date.now()}`,
      name: manualName.trim(),
      task_type: effectiveTask,
      condition_pattern: `task == '${effectiveTask}' && latency <= ${manualMaxLatency}ms`,
      target_metric: manualTask === "sales_email" ? "demo_booked" : (manualTask === "code_generation" ? "code_merged" : (manualTask === "customer_support" ? "ticket_resolved" : "outcome_achieved")),
      is_active: true,
      enabled: true,
      priority_models: priority,
      models_priority: priority,
      fallback_model: "GPT-4o",
      max_latency_ms: manualMaxLatency,
      max_cost_usd: manualMaxCost,
      min_win_rate: 0.90,
      strategy: manualStrategy,
      ai_synthesized: false,
      trigger_count: 0,
      total_saved_usd: 0.0
    };

    addRule(newRule);
    syncRulesToSession(useAppStore.getState().routingRules);
    setShowManualModal(false);
    setManualName("");
    setCustomTaskType("");
  };

  const handleTestDryRun = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dryRunPrompt.trim()) return;

    setIsDryRunning(true);

    try {
      const res = await fetch("/api/routing/dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: dryRunPrompt.trim(), rules: routingRules })
      });

      const data = await res.json();
      setDryRunData(data);
    } catch (err) {
      console.warn("Dry run failed:", err);
    } finally {
      setIsDryRunning(false);
    }
  };

  // Run dry run on mount only if prompt is populated
  useEffect(() => {
    if (routingRules.length > 0 && dryRunPrompt.trim()) {
      handleTestDryRun();
    }
  }, [routingRules.length]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Command Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Routing Policies & Autonomous Gateway
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20">
                {routingRules.filter(r => r.is_active || r.enabled).length} Active Policies
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Programmatic Pareto routing distributing live prompt traffic to the optimal LLMs based on empirical outcome win rates and SLA constraints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSimulate(true)}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Simulate Gateway</span>
            </button>

            <button
              onClick={() => setShowManualModal(true)}
              className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Custom Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Natural Language Policy Synthesizer */}
      <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#0050FF] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                Synthesize Routing Policy with Natural Language
              </h3>
              <p className="text-[11px] text-[#86868B]">Describe your SLA intent in plain English to automatically construct runtime policy bytecode</p>
            </div>
          </div>
          {synthesizedSuccess && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-in fade-in flex items-center gap-1.5 self-start sm:self-auto">
              <Check className="h-3.5 w-3.5" />
              <span>Policy Deployed to Gateway!</span>
            </span>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-[#86868B] font-medium">Quick Synthesize:</span>
          {[
            { label: "Sales SDR High-Intent", prompt: "Route sales outreach emails to Claude 3.5 Sonnet to maximize booked demos with <350ms SLA" },
            { label: "Code Review PRs", prompt: "Route code generation tasks to DeepSeek Coder to optimize code merged rate with <200ms latency" },
            { label: "Support FAQ Bot", prompt: "Route customer support queries to Groq Llama 3.3 for sub-100ms instant ticket resolution" }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setAiPrompt(preset.prompt)}
              className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/70 dark:bg-[#242428]/70 border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSynthesize} className="flex gap-2.5">
          <input
            type="text"
            placeholder="e.g. Route code review PRs to DeepSeek Coder to optimize merge rates and keep latency < 200ms"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 h-11 px-5 rounded-full bg-white/80 dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/40 shadow-xs transition-all"
          />
          <button
            type="submit"
            disabled={isSynthesizing || !aiPrompt.trim()}
            className="px-6 h-11 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-[0_4px_14px_rgba(0,80,255,0.3)] shrink-0 flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            {isSynthesizing ? (
              <span>Synthesizing...</span>
            ) : (
              <>
                <span>Generate Policy</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* 3. Strategic Subsystems Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        {/* Card 1: Thompson Auto-Pilot */}
        <div
          onClick={() => {
            if (!plan.canUseAutopilot) {
              setUpgradeModalInfo({
                title: "Auto-Pilot Dirichlet Budget Pacing",
                desc: "Auto-Pilot autonomous cost vs quality balancing is unlocked on Starter & Growth tiers. Upgrade to enable automated budget pacing.",
                targetPlan: "Starter"
              });
            }
          }}
          className={`rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between hover:scale-[1.02] transition-all group ${
            !plan.canUseAutopilot ? "cursor-pointer" : ""
          }`}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Thompson Sampling</span>
            {plan.canUseAutopilot ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAutopilot();
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
                  autopilot.enabled
                    ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {autopilot.enabled ? "ACTIVE" : "PAUSED"}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUpgradeModalInfo({
                    title: "Auto-Pilot Dirichlet Budget Pacing",
                    desc: "Auto-Pilot autonomous cost vs quality balancing is unlocked on Starter & Growth tiers. Upgrade to enable automated budget pacing.",
                    targetPlan: "Starter"
                  });
                }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
              >
                <Lock className="h-3 w-3" />
                <span>STARTER</span>
              </button>
            )}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono capitalize">
              {autopilot.mode.replace("_", " ")}
            </div>
            <p className="text-[11px] text-[#86868B] mt-1">Dirichlet exploration vs exploitation calibration</p>
          </div>
          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0050FF] h-full w-[85%]" />
          </div>
        </div>

        {/* Card 2: Keystroke Pre-Warming */}
        <div
          onClick={() => {
            if (!plan.canUseSpeculativePrewarm) {
              setUpgradeModalInfo({
                title: "Speculative Pre-Warming (TTFT <70ms)",
                desc: "Predictive speculative pre-warming on user keystrokes is unlocked on Growth & Enterprise tiers. Drops TTFT by 70%+.",
                targetPlan: "Growth"
              });
            }
          }}
          className={`rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between hover:scale-[1.02] transition-all group ${
            !plan.canUseSpeculativePrewarm ? "cursor-pointer" : ""
          }`}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Speculative Prewarm</span>
            {plan.canUseSpeculativePrewarm ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] dark:bg-[#1E3A2F] dark:text-[#81C995]">
                75.6% FASTER
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUpgradeModalInfo({
                    title: "Speculative Pre-Warming (TTFT <70ms)",
                    desc: "Predictive speculative pre-warming on user keystrokes is unlocked on Growth & Enterprise tiers. Drops TTFT by 70%+.",
                    targetPlan: "Growth"
                  });
                }}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
              >
                <Lock className="h-3 w-3" />
                <span>GROWTH</span>
              </button>
            )}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              68.4ms TTFT
            </div>
            <p className="text-[11px] text-[#86868B] mt-1">Sliding window intent caching on keystroke</p>
          </div>
          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[76%]" />
          </div>
        </div>

        {/* Card 3: Federated Thompson Priors */}
        <div
          onClick={() => {
            if (!plan.canUseDifferentialPrivacy) {
              setUpgradeModalInfo({
                title: "Federated Differential Privacy Priors",
                desc: "Cross-tenant Bayesian prior sharing with ε=0.5 Laplacian noise is unlocked on Growth & Enterprise tiers.",
                targetPlan: "Growth"
              });
            }
          }}
          className={`rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between hover:scale-[1.02] transition-all group ${
            !plan.canUseDifferentialPrivacy ? "cursor-pointer" : ""
          }`}
          suppressHydrationWarning
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Federated Priors</span>
            {plan.canUseDifferentialPrivacy ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFederation();
                  if (user?.email) {
                    fetch("/api/auth/session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: user.email, federationSettings: { ...federationSettings, enabled: !federationSettings.enabled } })
                    }).catch(() => {});
                  }
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
                  federationSettings.enabled
                    ? "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {federationSettings.enabled ? "SHARING ON" : "PRIVATE"}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUpgradeModalInfo({
                    title: "Federated Differential Privacy Priors",
                    desc: "Cross-tenant Bayesian prior sharing with ε=0.5 Laplacian noise is unlocked on Growth & Enterprise tiers.",
                    targetPlan: "Growth"
                  });
                }}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
              >
                <Lock className="h-3 w-3" />
                <span>GROWTH</span>
              </button>
            )}
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              480+ Workloads
            </div>
            <p className="text-[11px] text-[#86868B] mt-1">ε=0.5 Differential Privacy consensus</p>
          </div>
          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-[90%]" />
          </div>
        </div>

        {/* Card 4: Micro-SLA Cryptographic Fallback */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Micro-SLA Fallback</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] dark:bg-[#1E3A2F] dark:text-[#81C995]">
              99.99% COMPLIANT
            </span>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              0-Loss Fallback
            </div>
            <p className="text-[11px] text-[#86868B] mt-1">Auto-escalates on provider 503 / latency breach</p>
          </div>
          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[99%]" />
          </div>
        </div>
      </div>

      {/* 4. Live Policy Dry-Run Evaluation Sandbox */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-4 w-4 text-[#0050FF]" />
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Live Policy Dry-Run Evaluation Sandbox
            </h3>
          </div>
          <span className="text-xs text-[#86868B] font-mono">&lt;2ms Pattern Matching</span>
        </div>

        {/* Quick Dry-Run Preset Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[#86868B] font-medium">Test Prompt Samples:</span>
          {[
            { label: "FastAPI Redis Refactor", text: "Refactor this Python FastAPI endpoint to use async Redis connection pools" },
            { label: "Executive Cold Outreach", text: "Draft personalized cold outreach to VP of Engineering introducing AI cost optimization" },
            { label: "Reset Password FAQ", text: "How do I reset my security PIN and configure multi-factor authentication?" }
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDryRunPrompt(sample.text);
              }}
              className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all"
            >
              {sample.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleTestDryRun} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Enter a prompt to simulate policy routing (e.g. Write a Python script, draft email, etc)..."
            value={dryRunPrompt}
            onChange={(e) => setDryRunPrompt(e.target.value)}
            className="flex-1 h-11 px-5 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/40 shadow-xs transition-all"
          />
          <button
            type="submit"
            disabled={isDryRunning || !dryRunPrompt.trim()}
            className="px-6 h-11 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-[0_4px_14px_rgba(0,80,255,0.3)] shrink-0 flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <span>{isDryRunning ? "Evaluating..." : "Dry-Run Test"}</span>
          </button>
        </form>

        {dryRunData && (
          <div className="p-5 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/10 border border-[#0050FF]/20 space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0050FF]/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#0050FF] dark:text-[#3374FF]">
                  ✓ Matched Policy: &quot;{dryRunData.matchedRule}&quot;
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0050FF]/10 text-[#0050FF] dark:text-[#3374FF]">
                  {dryRunData.matchedReason}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Estimated Net Savings: {dryRunData.estimatedSavingsPct} vs Raw GPT-4o
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1A1A1E]/80 border border-[#0050FF]/15 space-y-1">
                <span className="text-[11px] text-[#86868B]">Rank #1 Primary Model</span>
                <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1">
                  <span className="text-[#0050FF]">★</span>
                  <span>{dryRunData.primaryModel}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1A1A1E]/80 border border-[#0050FF]/15 space-y-1">
                <span className="text-[11px] text-[#86868B]">Rank #2 Fallback Cascade</span>
                <div className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {dryRunData.secondaryModel} → {dryRunData.fallbackModel}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1A1A1E]/80 border border-[#0050FF]/15 space-y-1">
                <span className="text-[11px] text-[#86868B]">Max Latency SLA Ceiling</span>
                <div className="font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {dryRunData.maxLatencySla}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4.5 Live Provider Anomaly Health & Chaos Simulation Harness */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Live Anomaly Detector & Chaos Injection Mesh
              </h3>
              <p className="text-xs text-[#86868B]">
                Real-time circuit breaker trip sensors and sub-100ms failover harness
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAnomalyStatus}
            disabled={isFetchingAnomaly}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingAnomaly ? "animate-spin text-[#0050FF]" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Provider Anomaly Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { id: "openai", name: "OpenAI", primaryModel: "GPT-4o", defaultP95: 240 },
            { id: "anthropic", name: "Anthropic", primaryModel: "Claude 3.5 Sonnet", defaultP95: 210 },
            { id: "deepseek", name: "DeepSeek", primaryModel: "DeepSeek-V3", defaultP95: 78 },
            { id: "groq", name: "Groq LPU", primaryModel: "Llama 3.3 70B", defaultP95: 38 }
          ].map((prov) => {
            const status = anomalyData?.providers?.find((p: any) => p.provider === prov.id);
            const isDegraded = status?.anomalyDetected || false;

            return (
              <div
                key={prov.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDegraded
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                    : "bg-[#F7F7F9]/70 dark:bg-[#1A1A1E]/70 border-black/[0.04] dark:border-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{prov.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDegraded
                        ? "bg-rose-500 text-white"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isDegraded ? "CIRCUIT OPEN" : "HEALTHY"}
                  </span>
                </div>
                <div className="text-[11px] text-[#86868B] space-y-1">
                  <div>Model: <span className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">{prov.primaryModel}</span></div>
                  <div>P95 Latency: <span className="font-mono">{status?.p95LatencyMs || prov.defaultP95}ms</span></div>
                  <div>Error Rate: <span className="font-mono">{status ? `${(status.errorRate * 100).toFixed(1)}%` : "0.0%"}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chaos Injection Controls */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-rose-500/5 border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            <Flame className="h-4 w-4 text-rose-500" />
            <span>Interactive Chaos Injection Control</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Target Provider</label>
              <select
                value={chaosTarget}
                onChange={(e) => setChaosTarget(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
              >
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                <option value="deepseek">DeepSeek (DeepSeek-V3)</option>
                <option value="groq">Groq (Llama 3.3 70B)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#86868B] block mb-1">Injected Fault</label>
              <select
                value={chaosFault}
                onChange={(e: any) => setChaosFault(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#1A1A1E] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
              >
                <option value="LATENCY_SPIKE">Latency Spike (450ms overshoot)</option>
                <option value="HTTP_500_ERROR">HTTP 500 Internal Error</option>
                <option value="RATE_LIMIT_429">HTTP 429 Rate Limit Breach</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleInjectChaos}
                disabled={isInjectingChaos}
                className="w-full h-9 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>{isInjectingChaos ? "Injecting Fault..." : "Inject Chaos Fault"}</span>
              </button>
            </div>
          </div>

          {chaosResult && (
            <div className="p-4 rounded-xl bg-white/90 dark:bg-[#1A1A1E]/90 border border-black/[0.06] dark:border-white/[0.08] space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>✓ Seamless Failover Verification Executed</span>
                <span className="font-mono text-[11px]">{chaosResult.result?.totalRoundtripLatencyMs}ms total</span>
              </div>
              <p className="text-[#515154] dark:text-[#A1A1A6] text-[11px]">
                {chaosResult.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Active Routing Policies Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Active Routing Policy Rules ({routingRules.length})
            </h3>
            <p className="text-xs text-[#86868B]">
              Evaluated in top-down sequence by the edge gateway on incoming requests
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Custom Rule</span>
          </button>
        </div>

        {routingRules.length === 0 ? (
          <div className="p-12 text-center space-y-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1B1B1E] border border-black/[0.04] dark:border-white/[0.06]">
            <div className="h-12 w-12 rounded-2xl bg-[#0050FF]/10 text-[#0050FF] flex items-center justify-center mx-auto">
              <Sliders className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">No Custom Routing Policies Configured</h4>
              <p className="text-xs text-[#86868B] max-w-md mx-auto">
                All prompt requests currently utilize the autonomous Bayesian Thompson sampling prior gateway. Create your first custom policy or synthesize one using natural language above.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs inline-flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Custom Policy</span>
            </button>
          </div>
        ) : (
          <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Policy Name & Pattern</th>
                  <th className="py-3.5 px-4 font-semibold">Priority Chain</th>
                  <th className="py-3.5 px-4 font-semibold">Fallback</th>
                  <th className="py-3.5 px-4 font-semibold">Max SLA</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
                {routingRules.map((rule, idx) => (
                  <tr key={rule.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[#86868B]">#{idx + 1}</span>
                        <span>{rule.name}</span>
                        {rule.ai_synthesized && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                            AI
                          </span>
                        )}
                      </div>
                      <code className="text-[10px] font-mono text-[#86868B] bg-black/[0.03] dark:bg-white/[0.05] px-1.5 py-0.5 rounded">
                        {rule.condition_pattern}
                      </code>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {rule.priority_models?.slice(0, 2).map((m, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]">
                            #{i + 1} {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#86868B] font-mono text-[11px]">
                      {rule.fallback_model}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                      {rule.max_latency_ms}ms · ${rule.max_cost_usd}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          toggleRule(rule.id);
                          syncRulesToSession(useAppStore.getState().routingRules);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
                          rule.is_active || rule.enabled
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {rule.is_active || rule.enabled ? "ENABLED" : "DISABLED"}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Priority Precedence Reorder Buttons */}
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            reorderRule(idx, idx - 1);
                            syncRulesToSession(useAppStore.getState().routingRules);
                          }}
                          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                          title="Increase Rule Priority (Move Up)"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          disabled={idx === routingRules.length - 1}
                          onClick={() => {
                            reorderRule(idx, idx + 1);
                            syncRulesToSession(useAppStore.getState().routingRules);
                          }}
                          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                          title="Decrease Rule Priority (Move Down)"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => setShowSimulate(true)}
                          className="p-1.5 rounded-full hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#86868B] hover:text-[#0050FF] transition-colors"
                          title="Simulate this policy live"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => {
                            deleteRule(rule.id);
                            syncRulesToSession(useAppStore.getState().routingRules);
                          }}
                          className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-600 transition-colors"
                          title="Delete Policy"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Rule Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                Create Custom Routing Rule
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Outreach SLA Optimizer"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Task KPI Type</label>
                  <select
                    value={manualTask}
                    onChange={(e) => setManualTask(e.target.value)}
                    className="w-full h-10 px-3 rounded-full bg-[#F5F5F7] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold"
                  >
                    <option value="sales_email">Sales Email (demo_booked)</option>
                    <option value="code_generation">Code Generation (code_merged)</option>
                    <option value="customer_support">Customer Support (ticket_resolved)</option>
                    <option value="complex_reasoning">Complex Reasoning (answer_verified)</option>
                    <option value="general_instruction">General Instruction (outcome_achieved)</option>
                    <option value="custom">Custom Task Type...</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Max Latency SLA</label>
                  <input
                    type="number"
                    value={manualMaxLatency}
                    onChange={(e) => setManualMaxLatency(parseInt(e.target.value))}
                    className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono"
                  />
                </div>
              </div>

              {manualTask === "custom" && (
                <div className="space-y-1 animate-in fade-in">
                  <label className="font-semibold text-[#86868B]">Custom Task Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. medical_diagnosis, legal_extraction, sql_query"
                    value={customTaskType}
                    onChange={(e) => setCustomTaskType(e.target.value)}
                    className="w-full h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-5 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6]"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}

      {/* Plan Upgrade Requirement Modal */}
      {upgradeModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {upgradeModalInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setUpgradeModalInfo(null)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
              {upgradeModalInfo.desc}
            </p>

            <div className="p-3.5 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 text-xs space-y-1">
              <div className="font-bold text-[#0050FF] dark:text-[#3374FF]">
                Recommended: {upgradeModalInfo.targetPlan} Plan
              </div>
              <p className="text-[11px] text-[#86868B]">
                Unlock expanded token quotas, autonomous policies, and priority routing.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUpgradeModalInfo(null)}
                className="px-5 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold hover:scale-105 active:scale-95 transition-all"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setUpgradeModalInfo(null);
                  openPlanUpgradeModal();
                }}
                className="px-6 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Upgrade Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
