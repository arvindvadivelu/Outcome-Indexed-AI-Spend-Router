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
  ShieldCheck,
  Cpu,
  Bot,
  Sparkles,
  Gauge
} from "lucide-react";
import { useAppStore, LogItem } from "@/lib/store";

const SAMPLE_PROMPTS = [
  {
    label: "Cold Outreach (Sales)",
    task: "sales_email",
    prompt: "Write a high-converting cold email to the VP of Engineering at a Series B FinTech company proposing our AI router to cut token spend by 40%."
  },
  {
    label: "Code Refactoring (Dev)",
    task: "code_generation",
    prompt: "Refactor this TypeScript Next.js API route to use streaming responses and handle Redis cache misses gracefully."
  },
  {
    label: "Customer Support (FAQ)",
    task: "customer_support",
    prompt: "Explain why our P95 latency is 184ms and how our circuit breaker fallback logic prevents downtime if Claude or OpenAI encounters a 500 error."
  }
];

export function SimulateRequestModal({ onClose }: { onClose: () => void }) {
  const { currency, addLog, recordOutcome } = useAppStore();
  const [selectedTask, setSelectedTask] = useState("sales_email");
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0].prompt);
  const [strategy, setStrategy] = useState("outcome_optimized");

  // Advanced AI Subsystem Toggles
  const [enableCompression, setEnableCompression] = useState(true);
  const [enableSpeculative, setEnableSpeculative] = useState(true);
  const [enableCritic, setEnableCritic] = useState(true);
  const [enableAutoJudge, setEnableAutoJudge] = useState(true);

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

      let model = "claude-3-5-sonnet-20241022";
      let provider = "anthropic";
      let cost = 0.0034;
      let latency = enableSpeculative ? 140 : 380;
      let winRate = 92.4;
      let speculativeWinner = false;
      let criticTriggered = false;

      if (isCode) {
        model = "deepseek-coder";
        provider = "deepseek";
        cost = 0.00065;
        latency = enableSpeculative ? 115 : 310;
        winRate = 92.1;
        speculativeWinner = enableSpeculative;
      } else if (isSupport) {
        model = "llama-3.3-70b-versatile";
        provider = "groq";
        cost = 0.00018;
        latency = 84;
        winRate = 95.8;
        speculativeWinner = true;
      } else if (strategy === "cost_minimum") {
        model = "deepseek-chat";
        provider = "deepseek";
        cost = 0.00042;
        latency = enableSpeculative ? 95 : 280;
        winRate = 89.7;
        speculativeWinner = enableSpeculative;
      }

      if (enableCritic && Math.random() < 0.15) {
        criticTriggered = true;
      }

      const baselineCost = 0.0052;
      const savedAmount = Math.max(0, baselineCost - cost);
      const savedPct = Math.round((savedAmount / baselineCost) * 100);
      const reqId = `oir_sim_${Math.random().toString(36).substr(2, 7)}`;

      const simResult = {
        requestId: reqId,
        selectedModel: model,
        provider,
        taskType: selectedTask,
        complexityScore: isCode ? 0.85 : (isSupport ? 0.35 : 0.65),
        winRate,
        costUSD: cost,
        costINR: cost * 86.5,
        savedUSD: savedAmount,
        savedINR: savedAmount * 86.5,
        savedPct,
        latencyMs: latency,
        speculativeWinner,
        criticTriggered,
        autoJudgePassed: enableAutoJudge,
        autoJudgeScore: 0.94,
        responseContent: isCode
          ? `\`\`\`typescript\n// Autonomous AI Optimized streaming handler\nexport async function POST(req: Request) {\n  const { prompt } = await req.json();\n  // Speculative & Critic verified dispatch\n  return new Response(JSON.stringify({ status: "success", model: "${model}", latency: "${latency}ms" }));\n}\n\`\`\``
          : `Subject: Cut your AI token bill by 40% with Outcome-Indexed Routing\n\nHi Alex,\n\nI noticed your team is scaling LLM features. OutcomeRouter dynamically switches between Claude 3.5, DeepSeek, and Groq based on conversion KPIs—saving teams $12K/month while closing +14% more pipeline.\n\nOpen to a 10-minute teardown this Thursday?\n\nBest,\nArjun`,
        compressionTokensSaved: enableCompression ? 140 : 0
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
        outcome_success: enableAutoJudge ? true : null,
        outcome_metric: selectedTask === "sales_email" ? "demo_booked" : (isCode ? "code_merged" : "ticket_resolved"),
        prompt_preview: promptText.slice(0, 85) + "...",
        cached_hit: false,
        fallback_triggered: false,
        speculative_win: speculativeWinner,
        critic_escalated: criticTriggered,
        status: "success"
      };
      addLog(logEntry);
    }, 650);
  };

  const handleFeedback = (success: boolean) => {
    setFeedbackGiven(success);
    if (result) {
      recordOutcome(result.requestId, success);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-black/[0.08] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EEF4FF] text-[#0050FF]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#1D1D1F] text-base">Autonomous AI Routing Simulator</h3>
                <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
                  v1.1 AI-Enhanced
                </span>
              </div>
              <p className="text-xs text-[#86868B]">Evaluate Bayesian Pareto choice, Speculative execution, and Critic checks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-5 overflow-y-auto flex-1 pr-1">
          {/* Preset Prompts */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F]">Test Scenarios:</label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedTask(p.task);
                    setPromptText(p.prompt);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                    promptText === p.prompt
                      ? "bg-[#0050FF] border-[#0050FF] text-white font-medium shadow-sm shadow-[#0050FF]/25"
                      : "bg-[#F5F5F7] border-[#E5E5EA] text-[#515154] hover:text-[#1D1D1F]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Subsystems Control Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Active Autonomous AI Subsystems:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Speculative Router */}
              <button
                type="button"
                onClick={() => setEnableSpeculative(!enableSpeculative)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  enableSpeculative
                    ? "bg-[#EEF4FF] border-[#0050FF]/30 text-[#0050FF]"
                    : "bg-[#F5F5F7] border-[#E5E5EA] text-[#86868B]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Speculative Race</span>
                  <span className="text-[9px]">{enableSpeculative ? "ON" : "OFF"}</span>
                </div>
                <p className="text-[10px] text-[#86868B] mt-0.5">Dual fast-track</p>
              </button>

              {/* Self-Correction Critic */}
              <button
                type="button"
                onClick={() => setEnableCritic(!enableCritic)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  enableCritic
                    ? "bg-[#EEF4FF] border-[#0050FF]/30 text-[#0050FF]"
                    : "bg-[#F5F5F7] border-[#E5E5EA] text-[#86868B]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>Auto-Critic</span>
                  <span className="text-[9px]">{enableCritic ? "ON" : "OFF"}</span>
                </div>
                <p className="text-[10px] text-[#86868B] mt-0.5">Hallucination check</p>
              </button>

              {/* Autonomous LLM Judge */}
              <button
                type="button"
                onClick={() => setEnableAutoJudge(!enableAutoJudge)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  enableAutoJudge
                    ? "bg-[#EEF4FF] border-[#0050FF]/30 text-[#0050FF]"
                    : "bg-[#F5F5F7] border-[#E5E5EA] text-[#86868B]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>LLM-as-Judge</span>
                  <span className="text-[9px]">{enableAutoJudge ? "ON" : "OFF"}</span>
                </div>
                <p className="text-[10px] text-[#86868B] mt-0.5">Auto-verifies wins</p>
              </button>

              {/* Context Distiller */}
              <button
                type="button"
                onClick={() => setEnableCompression(!enableCompression)}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  enableCompression
                    ? "bg-[#EEF4FF] border-[#0050FF]/30 text-[#0050FF]"
                    : "bg-[#F5F5F7] border-[#E5E5EA] text-[#86868B]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>AI De-fluffing</span>
                  <span className="text-[9px]">{enableCompression ? "ON" : "OFF"}</span>
                </div>
                <p className="text-[10px] text-[#86868B] mt-0.5">-32% prompt tokens</p>
              </button>
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F]">Prompt Payload</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={3}
              className="w-full rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] p-3.5 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white font-mono transition-all"
            />
          </div>

          {/* Simulate Action Button */}
          <button
            onClick={handleSimulate}
            disabled={isLoading || !promptText}
            className="w-full py-3.5 rounded-full bg-[#0050FF] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0040CC] transition-all disabled:opacity-50 shadow-apple-blue"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Evaluating AI Priors, Speculative Race & Critic Checks...
              </span>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Execute Autonomous AI Route Evaluation</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="mt-4 p-5 rounded-3xl bg-[#FBFBFD] border border-[#0050FF]/20 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-pulse"></span>
                  <span className="text-xs font-bold text-[#1D1D1F]">Routed to:</span>
                  <span className="text-xs font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full border border-[#0050FF]/20">
                    {result.selectedModel}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#0050FF] font-mono font-bold">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>-{result.savedPct}% cost vs GPT-4o</span>
                </div>
              </div>

              {/* AI Subsystems Reasoning Badges */}
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E5EA] text-[#515154]">
                  Zero-Shot Complexity: <strong className="text-[#0050FF]">{result.complexityScore}</strong>
                </span>
                {result.speculativeWinner && (
                  <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/30 text-[#0050FF] font-bold">
                    ⚡ Speculative Fast-Track Won (Cancelled Flagship)
                  </span>
                )}
                {result.autoJudgePassed && (
                  <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/30 text-[#0050FF] font-bold">
                    🔍 LLM-Judge Verified: 94% Quality Score
                  </span>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-apple-sm">
                  <p className="text-[10px] text-[#86868B]">Win Rate</p>
                  <p className="text-xs font-mono font-bold text-[#0050FF]">{result.winRate}%</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-apple-sm">
                  <p className="text-[10px] text-[#86868B]">Cost / Req</p>
                  <p className="text-xs font-mono font-bold text-[#1D1D1F]">
                    {currency === "INR" ? `₹${result.costINR.toFixed(3)}` : `$${result.costUSD.toFixed(5)}`}
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-apple-sm">
                  <p className="text-[10px] text-[#86868B]">Latency</p>
                  <p className="text-xs font-mono font-bold text-[#0050FF]">{result.latencyMs}ms</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-apple-sm">
                  <p className="text-[10px] text-[#86868B]">Saved</p>
                  <p className="text-xs font-mono font-bold text-[#0050FF]">
                    +{currency === "INR" ? `₹${result.savedINR.toFixed(3)}` : `$${result.savedUSD.toFixed(5)}`}
                  </p>
                </div>
              </div>

              {/* Response Preview */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono text-[#86868B] uppercase">Output Preview</p>
                <div className="p-3 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] font-mono whitespace-pre-wrap">
                  {result.responseContent}
                </div>
              </div>

              {/* Feedback Confirmation */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5EA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1D1D1F]">Outcome Feedback</p>
                  <p className="text-[10px] text-[#86868B]">Auto-Judge classified as positive conversion</p>
                </div>
                {feedbackGiven === null ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedback(true)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] hover:bg-[#0050FF] hover:text-white text-[#0050FF] text-xs font-semibold transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Confirm Win</span>
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-red-50 text-[#86868B] hover:text-red-500 text-xs font-semibold transition-colors"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>Lost</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#0050FF] font-mono font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Thompson Sampling Prior Updated!</span>
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
