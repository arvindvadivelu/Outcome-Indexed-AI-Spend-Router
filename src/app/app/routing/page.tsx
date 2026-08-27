"use client";

import { useState } from "react";
import { useAppStore, RoutingRule } from "@/lib/store";
import {
  GitFork,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Bot,
  Gauge,
  CheckCircle2,
  ArrowRight,
  Zap,
  Cpu
} from "lucide-react";

export default function RoutingRulesPage() {
  const { routingRules, toggleRule, addRule, autopilot, setAutopilotMode, toggleAutopilot } = useAppStore();
  const [selectedStrategy, setSelectedStrategy] = useState("outcome_optimized");
  const [latencyCeiling, setLatencyCeiling] = useState(450);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);

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
      let priority = ["claude-3-5-sonnet", "deepseek-chat", "gpt-4o-mini"];
      let strategy = "outcome_optimized";

      if (lower.includes("sales") || lower.includes("email") || lower.includes("demo")) {
        task = "sales_email";
        metric = "demo_booked";
        priority = ["claude-3-5-sonnet", "deepseek-chat", "gpt-4o-mini"];
      } else if (lower.includes("code") || lower.includes("pr") || lower.includes("typescript")) {
        task = "code_generation";
        metric = "code_merged";
        priority = ["deepseek-coder", "claude-3-5-sonnet", "gpt-4o-mini"];
        strategy = "cost_minimum";
      } else if (lower.includes("support") || lower.includes("ticket") || lower.includes("faq")) {
        task = "customer_support";
        metric = "ticket_resolved";
        priority = ["llama-3.3-70b-versatile", "deepseek-chat", "gpt-4o-mini"];
        strategy = "latency_prioritized";
      }

      const newRule: RoutingRule = {
        id: `rule_ai_${Date.now()}`,
        name: `AI: ${aiPrompt.slice(0, 35)}...`,
        task_type: task,
        condition_pattern: `task == '${task}'`,
        target_metric: metric,
        is_active: true,
        enabled: true,
        priority_models: priority,
        models_priority: priority,
        fallback_model: "gpt-4o",
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
    }, 600);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Routing Policies & AI Auto-Pilot
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Natural language policy generation, dynamic budget auto-pacing, and fallback chains
          </p>
        </div>
      </div>

      {/* 1. Natural Language Policy Synthesizer Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0050FF]/20 shadow-apple-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1D1D1F]">Natural Language Policy Synthesizer</h3>
              <p className="text-[11px] text-[#86868B]">Describe your business goal in plain English, and the AI will compile your routing policy</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-1 rounded-full border border-[#0050FF]/20">
            Prompt-to-Policy AI
          </span>
        </div>

        <form onSubmit={handleSynthesize} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="e.g. Route customer support tickets to fastest models under 100ms with >95% resolution rate"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 h-11 px-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all font-mono"
          />
          <button
            type="submit"
            disabled={isSynthesizing || !aiPrompt.trim()}
            className="px-6 py-3 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSynthesizing ? (
              <span>Synthesizing Rule...</span>
            ) : (
              <>
                <Bot className="h-3.5 w-3.5" />
                <span>Synthesize Rule with AI</span>
              </>
            )}
          </button>
        </form>

        {synthesizedSuccess && (
          <div className="p-3 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/30 text-xs font-mono text-[#0050FF] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>AI Rule successfully synthesized and mounted to active routing table!</span>
          </div>
        )}
      </div>

      {/* 2. Autonomous Budget Auto-Pilot Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF4FF] text-[#0050FF]">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Autonomous Budget Auto-Pilot</h3>
              <p className="text-xs text-[#86868B]">Continuously balances quality vs. cost to guarantee 0% budget overruns</p>
            </div>
          </div>
          <button
            onClick={toggleAutopilot}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
              autopilot.enabled
                ? "bg-[#EEF4FF] text-[#0050FF] border border-[#0050FF]/30"
                : "bg-[#F5F5F7] text-[#86868B] border border-[#E5E5EA]"
            }`}
          >
            {autopilot.enabled ? "AUTO-PILOT ACTIVE" : "PAUSED"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mode 1: Optimal Pace */}
          <button
            onClick={() => setAutopilotMode("optimal_pace")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              autopilot.mode === "optimal_pace"
                ? "bg-white border-2 border-[#0050FF] shadow-apple-sm"
                : "bg-[#F5F5F7] border-[#E5E5EA] opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1D1D1F]">Optimal Pace</span>
              <span className="text-[10px] font-mono text-[#0050FF] font-bold">Standard (42% Cut)</span>
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-1.5">Maintains 93% win-rate while saving 42% on gross spend</p>
          </button>

          {/* Mode 2: Aggressive Savings */}
          <button
            onClick={() => setAutopilotMode("aggressive_savings")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              autopilot.mode === "aggressive_savings"
                ? "bg-white border-2 border-[#0050FF] shadow-apple-sm"
                : "bg-[#F5F5F7] border-[#E5E5EA] opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1D1D1F]">Aggressive Throttling</span>
              <span className="text-[10px] font-mono text-[#0050FF] font-bold">Max Savings (70%)</span>
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-1.5">Forces DeepSeek & Groq on low-complexity tasks to prevent budget breach</p>
          </button>

          {/* Mode 3: Quality Boost */}
          <button
            onClick={() => setAutopilotMode("quality_boost")}
            className={`p-4 rounded-2xl border text-left transition-all ${
              autopilot.mode === "quality_boost"
                ? "bg-white border-2 border-[#0050FF] shadow-apple-sm"
                : "bg-[#F5F5F7] border-[#E5E5EA] opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1D1D1F]">Quality Boost</span>
              <span className="text-[10px] font-mono text-[#0050FF] font-bold">Surplus Mode</span>
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-1.5">Reinvests surplus budget into Claude 3.5 Sonnet for peak conversions</p>
          </button>
        </div>
      </div>

      {/* 3. Task-Specific Routing Rules List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-[#1D1D1F]">Active Routing Rules</h3>

        <div className="space-y-3">
          {routingRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-6 rounded-3xl bg-white border transition-all shadow-apple-sm ${
                rule.enabled ? "border-black/[0.06]" : "opacity-60 border-[#E5E5EA]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-[#1D1D1F] text-sm">{rule.name}</h4>
                    {rule.ai_synthesized && (
                      <span className="text-[9px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" /> AI Synthesized
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
                      Metric: {rule.target_metric}
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B]">
                    Condition: <span className="font-mono text-[#515154]">{rule.condition_pattern}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                      rule.enabled
                        ? "bg-[#EEF4FF] text-[#0050FF] border border-[#0050FF]/30"
                        : "bg-[#F5F5F7] text-[#86868B] border border-[#E5E5EA]"
                    }`}
                  >
                    {rule.enabled ? "ACTIVE" : "PAUSED"}
                  </button>
                </div>
              </div>

              {/* Model Priority Chain */}
              <div className="mt-4 pt-4 border-t border-[#E5E5EA] flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#86868B] font-semibold text-[11px]">Priority Chain:</span>
                {rule.models_priority.map((model, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] px-2.5 py-1 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] font-medium">
                      {idx + 1}. {model}
                    </span>
                    {idx < rule.models_priority.length - 1 && (
                      <span className="text-[#86868B]">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
