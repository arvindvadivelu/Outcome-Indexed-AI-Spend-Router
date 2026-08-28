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
  ArrowRight
} from "lucide-react";

export default function RoutingRulesPage() {
  const { routingRules, toggleRule, addRule, deleteRule, autopilot, setAutopilotMode, toggleAutopilot } = useAppStore();

  // Natural Language Synthesizer state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedSuccess, setSynthesizedSuccess] = useState(false);

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsSynthesizing(true);
    setTimeout(() => {
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
      setIsSynthesizing(false);
      setSynthesizedSuccess(true);
      setAiPrompt("");
      setTimeout(() => setSynthesizedSuccess(false), 3000);
    }, 550);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
          Routing Rules & Auto-Pilot
        </h1>
        <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
          Configure how requests are distributed across LLMs to hit business targets
        </p>
      </div>

      {/* 1. Natural Language Policy Synthesizer (Apple Spotlight Style) */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0050FF]" />
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Create Rule with AI</h3>
          </div>
          <span className="text-[11px] text-[#86868B]">Plain English to Policy</span>
        </div>

        <form onSubmit={handleSynthesize} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Route code review PRs to DeepSeek Coder under 300ms latency"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] border border-transparent text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
          />
          <button
            type="submit"
            disabled={isSynthesizing || !aiPrompt.trim()}
            className="px-5 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm flex items-center gap-1.5"
          >
            {isSynthesizing ? "Synthesizing..." : "Create Policy"}
          </button>
        </form>

        {synthesizedSuccess && (
          <div className="p-3 rounded-xl bg-[#EEF4FF] text-xs text-[#0050FF] font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Policy generated and activated successfully!</span>
          </div>
        )}
      </div>

      {/* 2. Auto-Pilot Mode Switcher */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Autonomous Budget Auto-Pilot</h3>
            <p className="text-xs text-[#86868B]">Automatically rebalances model weights to ensure $0 budget overruns</p>
          </div>
          <button
            onClick={toggleAutopilot}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              autopilot.is_active
                ? "bg-[#EEF4FF] text-[#0050FF] border border-[#0050FF]/20"
                : "bg-[#F5F5F7] text-[#86868B]"
            }`}
          >
            {autopilot.is_active ? "Auto-Pilot Active" : "Auto-Pilot Paused"}
          </button>
        </div>

        {/* 3-Way Mode Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "optimal",
              label: "Optimal Balance",
              desc: "Balances 40% cost reduction with >92% win rates"
            },
            {
              id: "aggressive_savings",
              label: "Maximum Savings",
              desc: "Pushes maximum traffic to lowest-cost models ($0.18/1M)"
            },
            {
              id: "quality_boost",
              label: "Quality Priority",
              desc: "Favors flagship models for mission-critical tasks"
            }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAutopilotMode(mode.id as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                autopilot.mode === mode.id
                  ? "bg-[#EEF4FF]/50 border-[#0050FF] shadow-sm"
                  : "bg-white border-black/[0.06] hover:border-black/[0.12]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${autopilot.mode === mode.id ? "text-[#0050FF]" : "text-[#1D1D1F]"}`}>
                  {mode.label}
                </span>
                {autopilot.mode === mode.id && <span className="h-2 w-2 rounded-full bg-[#0050FF]"></span>}
              </div>
              <p className="text-[11px] text-[#86868B] mt-1 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Active Routing Policies List */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Active Routing Policies</h3>
            <p className="text-xs text-[#86868B]">{routingRules.length} rules configured</p>
          </div>
        </div>

        <div className="divide-y divide-[#F5F5F7]">
          {routingRules.map((rule) => {
            const isRuleActive = rule.enabled ?? rule.is_active ?? true;
            return (
              <div key={rule.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1D1D1F]">{rule.name}</span>
                    {rule.ai_synthesized && (
                      <span className="text-[10px] bg-[#EEF4FF] text-[#0050FF] font-medium px-2 py-0.5 rounded-full">
                        AI Generated
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#86868B]">
                    <span>Task: <strong className="text-[#515154] capitalize">{rule.task_type.replace("_", " ")}</strong></span>
                    <span>•</span>
                    <span>Target Metric: <strong className="text-[#515154] capitalize">{rule.target_metric.replace("_", " ")}</strong></span>
                    <span>•</span>
                    <span>Max Latency: <strong className="text-[#515154]">{rule.max_latency_ms}ms</strong></span>
                  </div>
                  {/* Priority Chain */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#86868B]">Priority:</span>
                    {(rule.priority_models || rule.models_priority || []).map((m, i) => (
                      <span key={i} className="text-[10px] font-medium bg-[#F5F5F7] text-[#515154] px-2 py-0.5 rounded-md">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      isRuleActive ? "bg-[#0050FF]" : "bg-[#E5E5EA]"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isRuleActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    ></span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-[#86868B] hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
