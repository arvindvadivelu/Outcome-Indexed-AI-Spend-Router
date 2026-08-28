"use client";

import { useState } from "react";
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
  Activity
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

  // Natural Language Synthesizer state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedSuccess, setSynthesizedSuccess] = useState(false);

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
        ai_synthesized: true
      };
      addRule(newRule);
    } else {
      // Fallback
      const lower = aiPrompt.toLowerCase();
      let task = "general_instruction";
      let metric = "user_satisfaction";
      let priority = ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"];
      let strategy = "outcome_optimized";

      if (lower.includes("sales") || lower.includes("email") || lower.includes("demo")) {
        task = "sales_email";
        metric = "demo_booked";
        priority = ["Claude 3.5 Sonnet", "DeepSeek-V3", "GPT-4o Mini"];
      } else if (lower.includes("code") || lower.includes("pr") || lower.includes("typescript") || lower.includes("bug")) {
        task = "code_generation";
        metric = "code_merged";
        priority = ["DeepSeek Coder", "Claude 3.5 Sonnet", "GPT-4o Mini"];
        strategy = "cost_minimum";
      } else if (lower.includes("support") || lower.includes("ticket") || lower.includes("faq") || lower.includes("help")) {
        task = "customer_support";
        metric = "ticket_resolved";
        priority = ["Groq Llama 3.3", "DeepSeek-V3", "GPT-4o Mini"];
        strategy = "latency_prioritized";
      }

      const newRule: RoutingRule = {
        id: `rule_${Date.now()}`,
        name: aiPrompt.slice(0, 40) + (aiPrompt.length > 40 ? "..." : ""),
        task_type: task,
        condition_pattern: `task == '${task}'`,
        target_metric: metric,
        is_active: true,
        enabled: true,
        priority_models: priority,
        models_priority: priority,
        fallback_model: "GPT-4o",
        max_latency_ms: 450,
        max_cost_usd: 0.0035,
        min_win_rate: 0.90,
        strategy,
        ai_synthesized: true
      };
      addRule(newRule);
    }

    setIsSynthesizing(false);
    setSynthesizedSuccess(true);
    setAiPrompt("");
    setTimeout(() => setSynthesizedSuccess(false), 3000);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          Routing Rules & Autonomous Engines
        </h1>
        <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
          Configure how requests are distributed across LLMs to hit business targets
        </p>
      </div>

      {/* 1. Natural Language Policy Synthesizer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">Create Rule with AI</h3>
          </div>
          <span className="text-[11px] text-[#86868B]">Plain English to Policy</span>
        </div>

        <form onSubmit={handleSynthesize} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Route code review PRs to DeepSeek Coder to optimize merge rates and keep latency <200ms"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:border-[#0050FF]/30 transition-all"
          />
          <button
            type="submit"
            disabled={isSynthesizing || !aiPrompt.trim()}
            className="px-5 h-10 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/25 shrink-0 flex items-center gap-1.5"
          >
            {isSynthesizing ? "Synthesizing..." : "Generate Rule"}
            <ArrowRight className="h-3 w-3" />
          </button>
        </form>

        {synthesizedSuccess && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Policy synthesized and deployed to gateway!</span>
          </div>
        )}
      </div>

      {/* 2. Dual Breakthrough Engines Grid: Federated Thompson + Speculative Pre-Warming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature 4: Cross-Tenant Federated Thompson Prior Federation */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
                Cross-Tenant Prior Federation
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] font-semibold">
              Epsilon=0.5 DP Certified
            </span>
          </div>

          <p className="text-xs text-[#86868B]">
            Blends local tenant data with anonymous Beta priors from <strong>{federationSettings.totalTenants}+ SaaS workloads</strong>, eliminating cold-start routing penalties.
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#515154] dark:text-[#8E8E93]">Consensus Weight Blend</span>
              <span className="text-[#0050FF] dark:text-[#3374FF] font-bold font-mono">
                {Math.round(federationSettings.weight * 100)}% Global / {Math.round((1 - federationSettings.weight) * 100)}% Local
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={federationSettings.weight}
              onChange={(e) => setFederationWeight(parseFloat(e.target.value))}
              className="w-full accent-[#0050FF] h-1.5 bg-[#F5F5F7] dark:bg-[#1F1F23] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#86868B]">
              <span>Purely Local (0%)</span>
              <span>Balanced (50%)</span>
              <span>Aggressive Global (100%)</span>
            </div>
          </div>
        </div>

        {/* Feature 1: Predictive Multi-Agent Speculative Pre-Warming */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
                Speculative Pre-Warming Engine
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] font-semibold">
              Active ({prewarmMetrics.activeHotSlots} GPU Slots)
            </span>
          </div>

          <p className="text-xs text-[#86868B]">
            Analyzes keystroke streaming buffers to pre-warm lightweight SLM contexts in background before user hits submit.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06]">
              <p className="text-[10px] text-[#86868B]">Speculative Hit Rate</p>
              <p className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono mt-0.5">{prewarmMetrics.hitRatePct}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06]">
              <p className="text-[10px] text-[#86868B]">Avg TTFT</p>
              <p className="text-xs font-bold text-[#0050FF] dark:text-[#3374FF] font-mono mt-0.5">{prewarmMetrics.acceleratedTtftMs}ms</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06]">
              <p className="text-[10px] text-[#86868B]">Latency Drop</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">-{prewarmMetrics.reductionPct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Auto-Pilot Mode Switcher */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">Budget Auto-Pilot Mode</h3>
            <p className="text-xs text-[#86868B]">Autonomous weight balancing for cost vs. outcome quality</p>
          </div>
          <button
            onClick={toggleAutopilot}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              autopilot.enabled
                ? "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20"
                : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B]"
            }`}
          >
            {autopilot.enabled ? "Auto-Pilot Active" : "Auto-Pilot Paused"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "optimal_pace",
              label: "Optimal Pace",
              desc: "Dynamic balance between cost reduction and peak outcome win rates"
            },
            {
              id: "aggressive_savings",
              label: "Maximum Savings",
              desc: "Aggressively routes to DeepSeek & Groq for up to 60%+ spend savings"
            },
            {
              id: "quality_boost",
              label: "Quality Priority",
              desc: "Prioritizes Claude 3.5 Sonnet and frontier models for critical paths"
            }
          ].map((mode) => (
            <div
              key={mode.id}
              onClick={() => setAutopilotMode(mode.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                autopilot.mode === mode.id
                  ? "border-[#0050FF] bg-[#EEF4FF]/40 dark:bg-[#0050FF]/15 shadow-xs"
                  : "border-black/[0.06] dark:border-white/[0.08] bg-[#FBFBFD] dark:bg-[#1F1F23] hover:border-black/[0.12]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{mode.label}</span>
                {autopilot.mode === mode.id && (
                  <CheckCircle2 className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
                )}
              </div>
              <p className="text-[11px] text-[#86868B] leading-relaxed">{mode.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Active Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
            Active Routing Rules ({routingRules.length})
          </h3>
        </div>

        <div className="space-y-3">
          {routingRules.map((rule) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{rule.name}</span>
                  {rule.ai_synthesized && (
                    <span className="text-[10px] bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] px-2 py-0.5 rounded-full font-medium">
                      AI Synthesized
                    </span>
                  )}
                  <span className="text-[10px] text-[#86868B] uppercase px-1.5 py-0.5 bg-[#F5F5F7] dark:bg-[#1F1F23] rounded">
                    {rule.task_type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#86868B]">
                  <span>Target: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{rule.target_metric}</strong></span>
                  <span>•</span>
                  <span>Strategy: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">{rule.strategy.replace("_", " ")}</strong></span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span>Priority:</span>
                    <span className="font-medium text-[#0050FF] dark:text-[#3374FF]">{rule.priority_models.join(" → ")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    rule.is_active
                      ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                      : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B]"
                  }`}
                >
                  {rule.is_active ? "Active" : "Disabled"}
                </button>

                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-1.5 rounded-full text-[#86868B] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
