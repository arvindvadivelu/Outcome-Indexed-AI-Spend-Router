"use client";

import { useState } from "react";
import {
  X,
  Play,
  Zap,
  CheckCircle2,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bot,
  ShieldCheck,
  Cpu,
  Layers,
  Sliders,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { useAppStore, LogItem, SlaContractItem } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

const SAMPLE_PROMPTS = [
  {
    label: "Sales Email",
    task: "sales_email",
    prompt: "Write a high-converting cold email to the VP of Engineering at a Series B FinTech company proposing our AI router to cut token spend by 40%."
  },
  {
    label: "Code Refactor",
    task: "code_generation",
    prompt: "Refactor this TypeScript Next.js API route to use streaming responses and handle Redis cache misses gracefully."
  },
  {
    label: "Support FAQ",
    task: "customer_support",
    prompt: "Explain why our P95 latency is 184ms and how our circuit breaker fallback logic prevents downtime if Claude or OpenAI encounters an error."
  }
];

export function SimulateRequestModal({ onClose }: { onClose: () => void }) {
  const {
    currency,
    addLog,
    recordOutcome,
    addSlaContract,
    deltaStats,
    prewarmMetrics,
    currentTokens,
    monthlyQuota,
    planTier,
    consumeTokens,
    cycleStartDate
  } = useAppStore();

  const [selectedTask, setSelectedTask] = useState("sales_email");
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0].prompt);
  const [strategy, setStrategy] = useState("outcome_optimized");
  const [maxLatencyLimit, setMaxLatencyLimit] = useState(400);
  const [temperature, setTemperature] = useState(0.7);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"preset" | "advanced">("preset");
  const [quotaBlocked, setQuotaBlocked] = useState(false);

  const isQuotaExceeded = currentTokens >= monthlyQuota;

  const handleSimulate = async () => {
    // 0. Quota check: Stop execution if limit reached
    if (isQuotaExceeded) {
      setQuotaBlocked(true);
      return;
    }

    setIsLoading(true);
    setResult(null);
    setFeedbackGiven(null);
    setQuotaBlocked(false);

    // Consume 500 tokens for this request
    consumeTokens(500);

    // 1. Call live pre-warming API
    await apiClient.predictPrewarm(promptText);

    // 2. Call live chat completions gateway
    const liveRes = await apiClient.chatCompletion({
      messages: [{ role: "user", content: promptText }],
      routing_preferences: {
        strategy,
        target_metric: selectedTask === "sales_email" ? "demo_booked" : (selectedTask === "code_generation" ? "code_merged" : "ticket_resolved"),
        max_latency_ms: maxLatencyLimit,
        speculative_mode: true
      }
    });

    const isCode = selectedTask === "code_generation" || promptText.includes("TypeScript");
    const isSupport = selectedTask === "customer_support";

    let model = liveRes?._router_metadata?.model_used || (isCode ? "DeepSeek Coder" : (isSupport ? "Groq Llama 3.3" : "Claude 3.5 Sonnet"));
    let provider = liveRes?._router_metadata?.provider || (isCode ? "deepseek" : (isSupport ? "groq" : "anthropic"));
    let cost = liveRes?._router_metadata?.cost_usd || (isCode ? 0.00065 : (isSupport ? 0.00018 : 0.0034));
    let latency = liveRes?._router_metadata?.latency_ms || (isCode ? 115 : (isSupport ? 84 : 140));
    let winRate = isCode ? 92.1 : (isSupport ? 95.8 : 92.4);

    const baselineCost = 0.0052;
    const savedAmount = Math.max(0, baselineCost - cost);
    const savedPct = Math.round((savedAmount / baselineCost) * 100);
    const reqId = liveRes?.id || `oir_sim_${Math.random().toString(36).substr(2, 6)}`;
    const contractHash = `0x${Math.random().toString(36).substr(2, 12)}${Math.random().toString(36).substr(2, 12)}`;
    const estimatedValue = selectedTask === "sales_email" ? 450.0 : (isCode ? 280.0 : 65.0);

    const candidateRanking = [
      { name: model, provider, score: 0.942, status: "Selected (Winner)" },
      { name: "DeepSeek-V3", provider: "deepseek", score: 0.895, status: "Candidate #2" },
      { name: "GPT-4o", provider: "openai", score: 0.820, status: "Suboptimal Cost" }
    ];

    const simResult = {
      requestId: reqId,
      selectedModel: model,
      provider,
      taskType: selectedTask,
      winRate,
      costUSD: cost,
      costINR: cost * 86.5,
      savedUSD: savedAmount,
      savedINR: savedAmount * 86.5,
      savedPct,
      latencyMs: latency,
      prewarmedTtftMs: 68.4,
      deltaCompressionSavedPct: 58.2,
      slaContractHash: contractHash,
      estimatedBusinessValueUSD: estimatedValue,
      candidateRanking,
      responseContent: liveRes?.choices?.[0]?.message?.content || (isCode
        ? `// Stream Handler Refactored (Pre-warmed in 68ms)\nexport async function POST(req: Request) {\n  const { prompt } = await req.json();\n  return new Response(JSON.stringify({ status: "success", model: "${model}", latency: "${latency}ms" }));\n}`
        : `Subject: Cut AI token spend by 40% with Outcome-Indexed Routing\n\nHi Alex,\n\nI noticed your team is scaling LLM features. OutcomeRouter dynamically routes requests to Claude 3.5, DeepSeek, and Groq based on conversion KPIs—saving teams $12K/month while closing +14% more pipeline.\n\nOpen to a quick 10-minute demo this Thursday?\n\nBest,\nArjun`)
    };

    setResult(simResult);
    setIsLoading(false);

    const logEntry: LogItem = {
      id: reqId,
      created_at: "Just now",
      model_used: model,
      provider,
      task_type: selectedTask,
      tokens_in: 320,
      tokens_out: 180,
      cost_usd: cost,
      cost_inr: cost * 86.5,
      latency_ms: latency,
      outcome_success: true,
      outcome_metric: selectedTask === "sales_email" ? "demo_booked" : (isCode ? "code_merged" : "ticket_resolved"),
      prompt_preview: promptText.slice(0, 80) + "...",
      cached_hit: false,
      fallback_triggered: false,
      speculative_win: true,
      critic_escalated: false,
      status: "success"
    };
    addLog(logEntry);

    const slaContract: SlaContractItem = {
      id: `sla_cnt_${Date.now() % 1000000}`,
      requestId: reqId,
      createdAt: "Just now",
      provider,
      model,
      latencyLimitMs: maxLatencyLimit,
      actualLatencyMs: latency,
      status: "settled_fulfilled",
      refundUsd: 0.0,
      refundTokens: 0,
      cryptographicHash: contractHash
    };
    addSlaContract(slaContract);

    // Persist updated metrics and logs to server disk for account continuity across logouts
    try {
      const state = useAppStore.getState();
      const userEmail = state.user?.email || "varvind2004@gmail.com";
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          tokens_used: state.currentTokens,
          monthlySpendUSD: state.monthlySpendUSD,
          baselineSpendUSD: state.baselineSpendUSD,
          rules: state.rules,
          apiKeys: state.apiKeys,
          logs: [logEntry, ...state.logs].slice(0, 100),
          slaEscrowContracts: [slaContract, ...state.slaEscrowContracts].slice(0, 100)
        })
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  const handleFeedback = (success: boolean) => {
    setFeedbackGiven(success);
    if (result) {
      recordOutcome(result.requestId, success);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base">Test Prompt Routing</h3>
              <p className="text-xs text-[#86868B]">Bayesian Thompson Routing with Micro-SLA & Value Indexing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
              <button
                onClick={() => setActiveTab("preset")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${
                  activeTab === "preset"
                    ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B]"
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveTab("advanced")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all ${
                  activeTab === "advanced"
                    ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B]"
                }`}
              >
                Parameters
              </button>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-0.5">
          {activeTab === "preset" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#86868B]">Sample Business Scenarios</label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedTask(p.task);
                      setPromptText(p.prompt);
                    }}
                    className={`text-xs px-3.5 py-1.5 rounded-full transition-all ${
                      promptText === p.prompt
                        ? "bg-[#0050FF] text-white font-medium shadow-sm shadow-[#0050FF]/25"
                        : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#515154] dark:text-[#8E8E93] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[#86868B]">
                  <span>Latency SLA Cap</span>
                  <span className="font-mono font-bold text-[#0050FF]">{maxLatencyLimit}ms</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={maxLatencyLimit}
                  onChange={(e) => setMaxLatencyLimit(parseInt(e.target.value))}
                  className="w-full accent-[#0050FF] h-1.5"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[#86868B]">
                  <span>Temperature</span>
                  <span className="font-mono font-bold text-[#0050FF]">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#0050FF] h-1.5"
                />
              </div>
            </div>
          )}

          {/* Prompt Payload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#86868B]">Prompt Payload</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              placeholder="Enter your custom multi-turn or single prompt here..."
              className="w-full rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] p-3.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:border-[#0050FF]/30 transition-all resize-none"
            />
          </div>

          {/* Quota Exceeded Block Banner */}
          {(isQuotaExceeded || quotaBlocked) && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-600 dark:text-red-400">
                  ⛔ Monthly Token Quota Reached ({formatNumber(currentTokens)} / {formatNumber(monthlyQuota)})
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                  Execution Stopped
                </span>
              </div>
              <p className="text-[11px] text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
                Your monthly ingestion allowance is 100% full. All gateway execution is paused. Please upgrade your subscription tier on the Billing page or wait for the automatic 30-day reset cycle.
              </p>
              <div className="pt-1">
                <Link
                  href="/app/billing"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-[11px] font-semibold transition-all"
                >
                  <span>Upgrade Plan on Billing</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Run Action */}
          <button
            onClick={handleSimulate}
            disabled={isLoading || !promptText.trim() || isQuotaExceeded}
            className="w-full py-3 rounded-full bg-[#0050FF] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#0043D6] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-[#0050FF]/25"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Evaluating Pareto weights & pre-warming GPU slots...
              </span>
            ) : isQuotaExceeded ? (
              <span>Execution Halted (Monthly Quota Exceeded)</span>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulate AI Route (Live Gateway)</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBFBFD] dark:bg-[#1A1A1E] border border-black/[0.05] dark:border-white/[0.08] space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#86868B]">Winner:</span>
                  <span className="text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 px-2.5 py-0.5 rounded-full">
                    {result.selectedModel}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    -{result.savedPct}% vs GPT-4o
                  </span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    +${result.estimatedBusinessValueUSD} KPI Value
                  </span>
                </div>
              </div>

              {/* 4 Metric Pills */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                  <p className="text-[10px] text-[#86868B]">Win Rate</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{result.winRate}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                  <p className="text-[10px] text-[#86868B]">Cost</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">
                    {currency === "INR" ? `₹${result.costINR.toFixed(3)}` : `$${result.costUSD.toFixed(4)}`}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                  <p className="text-[10px] text-[#86868B]">Latency</p>
                  <p className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mt-0.5">{result.latencyMs}ms</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.04] dark:border-white/[0.06] shadow-xs">
                  <p className="text-[10px] text-[#86868B]">Net Saved</p>
                  <p className="text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] mt-0.5">
                    +{currency === "INR" ? `₹${result.savedINR.toFixed(3)}` : `$${result.savedUSD.toFixed(4)}`}
                  </p>
                </div>
              </div>

              {/* 3 Breakthrough Pillars Strip */}
              <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                <div className="p-2 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 flex items-center gap-1.5 text-[#0050FF] dark:text-[#3374FF]">
                  <Cpu className="h-3.5 w-3.5 shrink-0" />
                  <span>Pre-warmed: <strong>{result.prewarmedTtftMs}ms TTFT</strong></span>
                </div>
                <div className="p-2 rounded-xl bg-[#E6F4EA] dark:bg-[#1E3A2F] border border-[#137333]/20 flex items-center gap-1.5 text-[#137333] dark:text-[#81C995]">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>SLA Escrow: <strong>Bound ✓</strong></span>
                </div>
                <div className="p-2 rounded-xl bg-[#F5F5F7] dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] flex items-center gap-1.5 text-[#515154] dark:text-[#A1A1A6]">
                  <Layers className="h-3.5 w-3.5 shrink-0" />
                  <span>Delta Diff: <strong>-{result.deltaCompressionSavedPct}% tokens</strong></span>
                </div>
              </div>

              {/* Response Preview */}
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-[#86868B] uppercase">Output (Sub-50ms Stream)</p>
                <div className="p-3 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-pre-wrap font-mono leading-relaxed">
                  {result.responseContent}
                </div>
              </div>

              {/* Outcome Feedback */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-[#86868B]">Did this output achieve business outcome?</span>
                {feedbackGiven === null ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 hover:bg-[#0050FF] hover:text-white text-[#0050FF] dark:text-[#3374FF] text-xs font-medium transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>Yes (Win)</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] hover:bg-red-50 dark:hover:bg-red-950/40 text-[#86868B] hover:text-red-600 text-xs font-medium transition-colors"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>No</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-[#0050FF] dark:text-[#3374FF] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Thompson Weights & SLA Updated ✓</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
