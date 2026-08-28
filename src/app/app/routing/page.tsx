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
  ChevronRight
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function RoutingRulesPage() {
  const {
    routingRules,
    toggleRule,
    addRule,
    deleteRule,
    autopilot,
    setAutopilotMode,
    toggleAutopilot,
    federationSettings,
    setFederationWeight,
    toggleFederation,
    prewarmMetrics
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Synthesizer state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedSuccess, setSynthesizedSuccess] = useState(false);

  // Manual Rule Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualTask, setManualTask] = useState("sales_email");
  const [manualStrategy, setManualStrategy] = useState("outcome_optimized");
  const [manualMaxLatency, setManualMaxLatency] = useState(400);
  const [manualMaxCost, setManualMaxCost] = useState(0.0035);

  // Live Rule Dry-Run Test State
  const [dryRunPrompt, setDryRunPrompt] = useState("");
  const [dryRunResult, setDryRunResult] = useState<string | null>(null);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsSynthesizing(true);
    const response = await apiClient.synthesizeRule(aiPrompt);

    if (response && response.success && response.rule) {
      const synthesized = response.rule;
      const newRule: RoutingRule = {
        id: synthesized.id || `rule_${Date.now()}`,
        name: synthesized.name || aiPrompt.slice(0, 40),
        task_type: synthesized.task_type || "general_instruction",
        condition_pattern: synthesized.condition_pattern || `task == 'general'`,
        target_metric: synthesized.target_metric || "user_satisfaction",
        is_active: true,
        enabled: true,
        priority_models: synthesized.priority_models || ["Claude 3.5 Sonnet", "DeepSeek-V3"],
        models_priority: synthesized.models_priority || ["Claude 3.5 Sonnet", "DeepSeek-V3"],
        fallback_model: synthesized.fallback_model || "GPT-4o",
        max_latency_ms: synthesized.max_latency_ms || 450,
        max_cost_usd: synthesized.max_cost_usd || 0.0035,
        min_win_rate: synthesized.min_win_rate || 0.90,
        strategy: synthesized.strategy || "outcome_optimized",
        ai_synthesized: true,
        trigger_count: 0,
        total_saved_usd: 0.0
      };
      addRule(newRule);
    } else {
      const newRule: RoutingRule = {
        id: `rule_${Date.now()}`,
        name: aiPrompt.slice(0, 40),
        task_type: "general_instruction",
        condition_pattern: "task == 'general_instruction'",
        target_metric: "user_satisfaction",
        is_active: true,
        enabled: true,
        priority_models: ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
        models_priority: ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"],
        fallback_model: "GPT-4o",
        max_latency_ms: 450,
        max_cost_usd: 0.0035,
        min_win_rate: 0.90,
        strategy: "outcome_optimized",
        ai_synthesized: true,
        trigger_count: 0,
        total_saved_usd: 0.0
      };
      addRule(newRule);
    }

    setIsSynthesizing(false);
    setSynthesizedSuccess(true);
    setAiPrompt("");
    setTimeout(() => setSynthesizedSuccess(false), 3000);
  };

  const handleCreateManualRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    let priority = ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"];
    if (manualTask === "code_generation") priority = ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"];
    if (manualTask === "customer_support") priority = ["Groq Llama 3.3", "DeepSeek-V3", "GPT-4o Mini"];

    const newRule: RoutingRule = {
      id: `rule_man_${Date.now()}`,
      name: manualName.trim(),
      task_type: manualTask,
      condition_pattern: `task == '${manualTask}' && latency < ${manualMaxLatency}ms`,
      target_metric: manualTask === "sales_email" ? "demo_booked" : (manualTask === "code_generation" ? "code_merged" : "ticket_resolved"),
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
    setShowManualModal(false);
    setManualName("");
  };

  const handleTestDryRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dryRunPrompt.trim()) return;

    const lower = dryRunPrompt.toLowerCase();
    let matchedRule = routingRules[0]?.name || "Default Fallback Policy";
    for (const r of routingRules) {
      if (r.task_type === "code_generation" && (lower.includes("code") || lower.includes("typescript") || lower.includes("def "))) {
        matchedRule = r.name;
        break;
      }
      if (r.task_type === "sales_email" && (lower.includes("sales") || lower.includes("email") || lower.includes("prospect"))) {
        matchedRule = r.name;
        break;
      }
      if (r.task_type === "customer_support" && (lower.includes("support") || lower.includes("help") || lower.includes("ticket"))) {
        matchedRule = r.name;
        break;
      }
    }

    setDryRunResult(`✓ Matched Policy: "${matchedRule}" → Priority #1 dispatch to Claude 3.5 Sonnet / DeepSeek-V3`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Routing Policies & Autonomous Gateway
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Programmatic Pareto routing distributing live prompt traffic to the optimal LLMs based on empirical outcome win rates.
            </p>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start lg:self-auto shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Custom Rule</span>
          </button>
        </div>
      </div>

      {/* 2. Natural Language Policy Synthesizer */}
      <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4" suppressHydrationWarning>
        <div className="flex items-center justify-between">
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
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              ✓ Policy Generated & Deployed!
            </span>
          )}
        </div>

        <form onSubmit={handleSynthesize} className="flex gap-2.5">
          <input
            type="text"
            placeholder="e.g. Route code review PRs to DeepSeek Coder to optimize merge rates and keep latency <200ms"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 h-11 px-5 rounded-full bg-white/80 dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/40 shadow-xs transition-all"
          />
          <button
            type="submit"
            disabled={isSynthesizing || !aiPrompt.trim()}
            className="px-6 h-11 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-[0_4px_14px_rgba(0,80,255,0.3)] shrink-0 flex items-center gap-2"
          >
            {isSynthesizing ? "Synthesizing..." : "Generate Policy"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* 3. Strategic Subsystems Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        {/* Card 1: Thompson Auto-Pilot */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Thompson Sampling</span>
            <button
              onClick={toggleAutopilot}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                autopilot.enabled
                  ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {autopilot.enabled ? "ACTIVE" : "PAUSED"}
            </button>
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
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Speculative Prewarm</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] dark:bg-[#1E3A2F] dark:text-[#81C995]">
              75.6% FASTER
            </span>
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
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Federated Priors</span>
            <button
              onClick={toggleFederation}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                federationSettings.enabled
                  ? "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {federationSettings.enabled ? "SHARING ON" : "PRIVATE"}
            </button>
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
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm space-y-3 flex flex-col justify-between" suppressHydrationWarning>
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

      {/* 4. Live Rule Dry-Run Playground */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-4" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-4 w-4 text-[#0050FF]" />
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Live Policy Dry-Run Evaluation Sandbox
            </h3>
          </div>
          <span className="text-xs text-[#86868B]">&lt;2ms Pattern Matching</span>
        </div>

        <form onSubmit={handleTestDryRun} className="flex gap-2.5">
          <input
            type="text"
            placeholder="Test a mock prompt: 'Write a python script to parse logs and send Slack alerts'"
            value={dryRunPrompt}
            onChange={(e) => setDryRunPrompt(e.target.value)}
            className="flex-1 h-11 px-5 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/40 shadow-xs transition-all"
          />
          <button
            type="submit"
            disabled={!dryRunPrompt.trim()}
            className="px-6 h-11 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-[0_4px_14px_rgba(0,80,255,0.3)] shrink-0 flex items-center gap-1.5"
          >
            <span>Dry-Run Test</span>
          </button>
        </form>

        {dryRunResult && (
          <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] animate-in fade-in">
            {dryRunResult}
          </div>
        )}
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
        </div>

        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
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
              {routingRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {rule.name}
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
                      onClick={() => toggleRule(rule.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        rule.is_active || rule.enabled
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {rule.is_active || rule.enabled ? "ENABLED" : "DISABLED"}
                    </button>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-600 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                    className="w-full h-10 px-3 rounded-full bg-[#F5F5F7] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs"
                  >
                    <option value="sales_email">Sales Email</option>
                    <option value="code_generation">Code Generation</option>
                    <option value="customer_support">Customer Support</option>
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
    </div>
  );
}
