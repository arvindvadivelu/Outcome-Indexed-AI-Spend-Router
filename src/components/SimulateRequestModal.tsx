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
  Layers
} from "lucide-react";
import { useAppStore, LogItem, SlaContractItem } from "@/lib/store";

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
  const { currency, addLog, recordOutcome, addSlaContract, deltaStats, prewarmMetrics } = useAppStore();
  const [selectedTask, setSelectedTask] = useState("sales_email");
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0].prompt);
  const [strategy, setStrategy] = useState("outcome_optimized");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const handleSimulate = async () => {
    setIsLoading(true);
    setResult(null);
    setFeedbackGiven(null);

    setTimeout(() => {
      const isCode = selectedTask === "code_generation" || promptText.includes("TypeScript");
      const isSupport = selectedTask === "customer_support";

      let model = "Claude 3.5 Sonnet";
      let provider = "anthropic";
      let cost = 0.0034;
      let latency = 140;
      let winRate = 92.4;

      if (isCode) {
        model = "DeepSeek Coder";
        provider = "deepseek";
        cost = 0.00065;
        latency = 115;
        winRate = 92.1;
      } else if (isSupport) {
        model = "Groq Llama 3.3";
        provider = "groq";
        cost = 0.00018;
        latency = 84;
        winRate = 95.8;
      } else if (strategy === "cost_minimum") {
        model = "DeepSeek-V3";
        provider = "deepseek";
        cost = 0.00042;
        latency = 95;
        winRate = 89.7;
      }

      const baselineCost = 0.0052;
      const savedAmount = Math.max(0, baselineCost - cost);
      const savedPct = Math.round((savedAmount / baselineCost) * 100);
      const reqId = `oir_sim_${Math.random().toString(36).substr(2, 6)}`;
      const contractHash = `0x${Math.random().toString(36).substr(2, 12)}${Math.random().toString(36).substr(2, 12)}`;

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
        responseContent: isCode
          ? `// Stream Handler Refactored (Pre-warmed in 68ms)\nexport async function POST(req: Request) {\n  const { prompt } = await req.json();\n  return new Response(JSON.stringify({ status: "success", model: "${model}", latency: "${latency}ms" }));\n}`
          : `Subject: Cut AI token spend by 40% with Outcome-Indexed Routing\n\nHi Alex,\n\nI noticed your team is scaling LLM features. OutcomeRouter dynamically routes requests to Claude 3.5, DeepSeek, and Groq based on conversion KPIs—saving teams $12K/month while closing +14% more pipeline.\n\nOpen to a quick 10-minute demo this Thursday?\n\nBest,\nArjun`
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
        latencyLimitMs: 400,
        actualLatencyMs: latency,
        status: "settled_fulfilled",
        refundUsd: 0.0,
        refundTokens: 0,
        cryptographicHash: contractHash
      };
      addSlaContract(slaContract);
    }, 450);
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
              <p className="text-xs text-[#86868B]">Bayesian routing with Speculative Pre-Warming & Micro-SLA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#1F1F23] flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-0.5">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#86868B]">Sample Scenarios</label>
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

          {/* Prompt Payload */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#86868B]">Prompt Text</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              placeholder="Enter your prompt here..."
              className="w-full rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] p-3.5 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:border-[#0050FF]/30 transition-all resize-none"
            />
          </div>

          {/* Run Action */}
          <button
            onClick={handleSimulate}
            disabled={isLoading || !promptText.trim()}
            className="w-full py-3 rounded-full bg-[#0050FF] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#0043D6] transition-all disabled:opacity-50 shadow-sm shadow-[#0050FF]/25"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Evaluating optimal model & pre-warming context...
              </span>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulate AI Route</span>
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
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  -{result.savedPct}% vs GPT-4o
                </span>
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
                <p className="text-[10px] font-medium text-[#86868B] uppercase">Output</p>
                <div className="p-3 rounded-xl bg-white dark:bg-[#202024] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-pre-wrap font-mono leading-relaxed">
                  {result.responseContent}
                </div>
              </div>

              {/* Outcome Feedback */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-[#86868B]">Was this outcome successful?</span>
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
                    <span>Prior Recorded & SLA Settled</span>
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
