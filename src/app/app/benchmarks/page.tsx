"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Zap,
  CheckCircle2,
  TrendingDown,
  Clock,
  Globe,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Check,
  Download,
  Play,
  Flame,
  Layers,
  ChevronRight,
  RefreshCw,
  Scale,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function BenchmarksPage() {
  const {
    benchmarks,
    setBenchmarks,
    currency,
    federationSettings,
    addRule,
    user,
    currentTokens,
    monthlyQuota,
    consumeTokens,
    openPlanUpgradeModal
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"win_rate" | "cost" | "latency" | "thompson">("win_rate");
  const [deployedModel, setDeployedModel] = useState<string | null>(null);
  const [showSimulate, setShowSimulate] = useState(false);
  const [quotaExceededNotice, setQuotaExceededNotice] = useState(false);
  const [policyAppliedNotice, setPolicyAppliedNotice] = useState<string | null>(null);

  // Synthetic Batch Test State
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);

  // Head-to-Head Comparison State
  const [compareModelA, setCompareModelA] = useState<string>("DeepSeek-V3");
  const [compareModelB, setCompareModelB] = useState<string>("GPT-4o");

  useEffect(() => {
    setMounted(true);
    fetch("/api/benchmarks")
      .then((res) => res.json())
      .then((data) => {
        if (data?.benchmarks && Array.isArray(data.benchmarks) && data.benchmarks.length > 0) {
          setBenchmarks(data.benchmarks);
        }
      })
      .catch((err) => console.warn("Live benchmark fetch notice:", err));
  }, [setBenchmarks]);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  const syncRulesToSession = (updatedRules: any[]) => {
    if (user?.email) {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, rules: updatedRules })
      }).catch((err) => console.warn("Benchmarks rule session sync notice:", err));
    }
  };

  const filteredBenchmarks = useMemo(() => {
    return benchmarks
      .filter((b) => {
        const matchesTask = selectedTask === "all" || b.task_type.toLowerCase().includes(selectedTask);
        const matchesSearch =
          b.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTask && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "win_rate") return b.win_rate - a.win_rate;
        if (sortBy === "cost") return a.avg_cost_usd - b.avg_cost_usd;
        if (sortBy === "latency") return a.avg_latency_ms - b.avg_latency_ms;
        if (sortBy === "thompson") return b.thompson_score - a.thompson_score;
        return 0;
      });
  }, [benchmarks, selectedTask, searchQuery, sortBy]);

  const modelAData = benchmarks.find((b) => b.model_name.toLowerCase().includes(compareModelA.toLowerCase())) || benchmarks[0];
  const modelBData = benchmarks.find((b) => b.model_name.toLowerCase().includes(compareModelB.toLowerCase())) || benchmarks[benchmarks.length - 1];

  const handleSetPrimary = (b: any) => {
    addRule({
      id: `rule_bench_${Date.now()}`,
      name: `${b.model_name} Primary Policy (${b.task_type})`,
      task_type: b.task_type,
      condition_pattern: `task == '${b.task_type}' && latency <= ${b.avg_latency_ms + 100}ms`,
      target_metric: "outcome_success",
      is_active: true,
      enabled: true,
      priority_models: [b.model_name, "DeepSeek-V3", "GPT-4o Mini"],
      models_priority: [b.model_name, "DeepSeek-V3", "GPT-4o Mini"],
      fallback_model: "GPT-4o",
      max_latency_ms: b.avg_latency_ms + 100,
      max_cost_usd: b.avg_cost_usd * 1.5,
      min_win_rate: b.win_rate,
      strategy: "outcome_optimized",
      ai_synthesized: true,
      trigger_count: 0,
      total_saved_usd: 0.0
    });
    syncRulesToSession(useAppStore.getState().routingRules);
    setDeployedModel(b.model_name);
    setTimeout(() => setDeployedModel(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = "Model,Provider,Task,WinRate,AvgLatencyMs,CostUSD,CostINR,ThompsonScore,ParetoTier\n";
    const rows = filteredBenchmarks
      .map(
        (b) =>
          `"${b.model_name}","${b.provider}","${b.task_type}",${(b.win_rate * 100).toFixed(1)}%,${b.avg_latency_ms},${b.avg_cost_usd},${(b.avg_cost_usd * 86.5).toFixed(4)},${b.thompson_score},"${b.pareto_tier}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `outcome_benchmarks_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleRunSyntheticBatch = async () => {
    if (currentTokens >= monthlyQuota) {
      setQuotaExceededNotice(true);
      return;
    }

    setIsRunningBatch(true);
    setBatchResults(null);

    try {
      const res = await fetch("/api/benchmarks/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_type: selectedTask })
      });
      const data = await res.json();
      if (data.success && data.results) {
        setBatchResults(data.results);
        consumeTokens(50);

        // Dynamically update benchmarks in Zustand store so leaderboard reflects fresh evaluation
        const updated = benchmarks.map((b) => {
          const matchingResult = data.results.find((r: any) =>
            r.model.toLowerCase().includes(b.model_name.toLowerCase()) ||
            b.model_name.toLowerCase().includes(r.model.toLowerCase())
          );
          if (matchingResult) {
            return {
              ...b,
              win_rate: matchingResult.winRate,
              avg_latency_ms: matchingResult.latencyMs,
              avg_cost_usd: matchingResult.costUsd,
              thompson_score: matchingResult.criticScore,
              pareto_tier: matchingResult.paretoTier as any
            };
          }
          return b;
        });
        setBenchmarks(updated);
      }
    } catch (err) {
      console.warn("Batch eval error:", err);
    } finally {
      setIsRunningBatch(false);
    }
  };

  const handleDeployEvaluatedPolicy = (topResult: any) => {
    const newRule = {
      id: `rule_synth_${Date.now()}`,
      name: `Synthetic Audit Optimal: ${topResult.model} (${topResult.task})`,
      task_type: topResult.task || "general_instruction",
      condition_pattern: `task == '${topResult.task || "general_instruction"}' && latency <= ${topResult.latencyMs + 50}ms`,
      target_metric: "outcome_success",
      is_active: true,
      enabled: true,
      priority_models: [topResult.model, "DeepSeek-V3", "GPT-4o Mini"],
      models_priority: [topResult.model, "DeepSeek-V3", "GPT-4o Mini"],
      fallback_model: "GPT-4o",
      max_latency_ms: topResult.latencyMs + 50,
      max_cost_usd: topResult.costUsd * 1.5,
      min_win_rate: topResult.winRate,
      strategy: "outcome_optimized",
      ai_synthesized: true,
      trigger_count: 0,
      total_saved_usd: 0.0
    };
    addRule(newRule);
    syncRulesToSession(useAppStore.getState().routingRules);
    setPolicyAppliedNotice(`Policy deployed: ${topResult.model} prioritized for ${topResult.task}!`);
    setTimeout(() => setPolicyAppliedNotice(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Empirical Outcome Benchmarks & Leaderboard
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20">
                {benchmarks.length} Audited Frontier Models
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Empirical quality-to-cost conversion rates across 480+ enterprise workloads updated dynamically via Dirichlet Bayesian consensus priors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSimulate(true)}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Simulate Model</span>
            </button>

            <button
              onClick={handleRunSyntheticBatch}
              disabled={isRunningBatch}
              className="h-10 px-5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`h-3.5 w-3.5 fill-current ${isRunningBatch ? "animate-spin" : ""}`} />
              <span>{isRunningBatch ? "Evaluating Models..." : "Run Live Synthetic Eval"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs hover:scale-105 active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Pareto Frontier Top Pick</span>
          <div className="my-4">
            <div className="text-3xl font-extrabold font-mono">DeepSeek-V3</div>
            <div className="text-xs text-white/70 mt-1">94.8% Win Rate · {formatCurrency(0.27 * rate, activeCurrency)} / 1M Tokens</div>
          </div>
          <span className="text-[11px] text-white/80">Cuts 88% cost vs baseline with zero quality drop</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Ultra-Low Latency Leader</span>
          <div className="my-4">
            <div className="text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Groq Llama 3.3</div>
            <div className="text-xs text-[#86868B] mt-1">48ms TTFT · {formatCurrency(0.18 * rate, activeCurrency)} / 1M Tokens</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">96.0% First-Contact Resolution</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Federated Prior Sharing</span>
          <div className="my-4">
            <div className="text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">480+ Workloads</div>
            <div className="text-xs text-[#86868B] mt-1">ε=0.5 Differential Privacy Consensus</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Dynamic Thompson update active</span>
        </div>
      </div>

      {/* Notifications */}
      {policyAppliedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{policyAppliedNotice}</span>
          </div>
          <Link href="/app/routing" className="px-3 py-1 bg-white text-emerald-800 rounded-full text-[11px] font-extrabold hover:bg-emerald-50 transition-all">
            View Routing Rules →
          </Link>
        </div>
      )}

      {quotaExceededNotice && (
        <div className="p-4 rounded-2xl bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Monthly Token Quota Reached! Upgrade your plan to run live synthetic evaluations.</span>
          </div>
          <button
            onClick={openPlanUpgradeModal}
            className="px-3.5 py-1.5 bg-white text-rose-700 rounded-full text-xs font-extrabold hover:bg-rose-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            Upgrade Plan →
          </button>
        </div>
      )}

      {/* 3. Synthetic Batch Evaluation Results Drawer */}
      {batchResults && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>Real-Time Synthetic Batch Evaluation (5 Models Audited · 50 Tokens Consumed)</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeployEvaluatedPolicy(batchResults[0])}
                className="px-3.5 py-1.5 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
              >
                <Zap className="h-3 w-3 fill-current" />
                <span>Deploy Optimal Policy ({batchResults[0]?.model})</span>
              </button>
              <button onClick={() => setBatchResults(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F] px-2 py-1">Dismiss</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {batchResults.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/90 dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 shadow-2xs">
                <div className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate flex items-center justify-between">
                  <span>{r.model}</span>
                  {i === 0 && <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">#1 WINNER</span>}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {r.latencyMs}ms · {formatCurrency(r.costUsd * rate, activeCurrency)}
                </div>
                <div className="text-[10px] text-[#86868B]">Critic Pass: {(r.criticScore * 100).toFixed(0)}% · {r.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Head-to-Head Pareto Model Comparator */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Scale className="h-4 w-4 text-[#0050FF]" />
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Head-to-Head Pareto Model Comparator
            </h3>
          </div>
          <span className="text-xs text-[#86868B]">Real-time efficiency delta</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Model A */}
          <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
            <label className="text-[11px] text-[#86868B] font-semibold">Candidate Model A</label>
            <select
              value={compareModelA}
              onChange={(e) => setCompareModelA(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.08] text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
            >
              {benchmarks.map((b) => (
                <option key={b.model_name} value={b.model_name}>{b.model_name} ({b.provider})</option>
              ))}
            </select>
            <div className="text-xs space-y-1 pt-1 font-mono">
              <div className="flex justify-between">
                <span className="text-[#86868B]">Win Rate:</span>
                <span className="font-bold text-[#0050FF]">{((modelAData?.win_rate || 0.94) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Cost / 1M:</span>
                <span className="font-bold">{formatCurrency((modelAData?.avg_cost_usd || 0.00042) * 1000 * rate, activeCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Avg TTFT:</span>
                <span className="font-bold">{modelAData?.avg_latency_ms || 64}ms</span>
              </div>
            </div>
          </div>

          {/* Delta Pill */}
          <div className="p-5 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0050FF] dark:text-[#3374FF]">
              Arbitration Delta
            </span>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {modelAData && modelBData ? (
                `${Math.max(0, Math.round(((modelBData.avg_cost_usd - modelAData.avg_cost_usd) / Math.max(0.0001, modelBData.avg_cost_usd)) * 100))}% Cheaper`
              ) : "88% Cheaper"}
            </div>
            <p className="text-[11px] text-[#86868B]">
              Latency Delta: {((modelBData?.avg_latency_ms || 380) - (modelAData?.avg_latency_ms || 64)) >= 0
                ? `${(modelBData?.avg_latency_ms || 380) - (modelAData?.avg_latency_ms || 64)}ms faster`
                : `${Math.abs((modelBData?.avg_latency_ms || 380) - (modelAData?.avg_latency_ms || 64))}ms slower`}
            </p>
            <button
              onClick={() => handleSetPrimary(modelAData)}
              className="mt-1 px-3.5 py-1.5 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-[11px] font-bold transition-all shadow-xs hover:scale-105 active:scale-95 flex items-center justify-center gap-1 mx-auto"
            >
              <Zap className="h-3 w-3 fill-current" />
              <span>Prioritize {modelAData?.model_name || "Model A"}</span>
            </button>
          </div>

          {/* Model B */}
          <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
            <label className="text-[11px] text-[#86868B] font-semibold">Comparison Model B (Baseline)</label>
            <select
              value={compareModelB}
              onChange={(e) => setCompareModelB(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#252528] border border-black/[0.06] dark:border-white/[0.08] text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
            >
              {benchmarks.map((b) => (
                <option key={b.model_name} value={b.model_name}>{b.model_name} ({b.provider})</option>
              ))}
            </select>
            <div className="text-xs space-y-1 pt-1 font-mono">
              <div className="flex justify-between">
                <span className="text-[#86868B]">Win Rate:</span>
                <span className="font-bold">{((modelBData?.win_rate || 0.84) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Cost / 1M:</span>
                <span className="font-bold">{formatCurrency((modelBData?.avg_cost_usd || 0.0052) * 1000 * rate, activeCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86868B]">Avg TTFT:</span>
                <span className="font-bold">{modelBData?.avg_latency_ms || 380}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Filter & Search Controls and Leaderboard Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Empirical Pareto Model Leaderboard
            </h3>
            <p className="text-xs text-[#86868B]">
              Autonomous prompt categorization and multi-objective Pareto ranking across active providers
            </p>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder="Filter models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-9 pl-9 pr-3 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
              />
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
              {(["win_rate", "cost", "latency"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full capitalize transition-all hover:scale-105 active:scale-95 ${
                    sortBy === s
                      ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Model & Provider</th>
                <th className="py-3.5 px-4 font-semibold">Task KPI</th>
                <th className="py-3.5 px-4 font-semibold text-center">Outcome Win Rate</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cost / 1M Tokens</th>
                <th className="py-3.5 px-4 font-semibold text-center">Avg TTFT</th>
                <th className="py-3.5 px-4 font-semibold text-center">Pareto Tier</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
              {filteredBenchmarks.map((b, i) => (
                <tr key={i} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">
                      {b.model_name}
                    </span>
                    <span className="text-[10px] text-[#86868B] uppercase font-mono">{b.provider}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                    {b.task_type}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold font-mono text-[#0050FF] dark:text-[#3374FF]">
                    {(b.win_rate * 100).toFixed(1)}%
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(b.avg_cost_usd * 1000 * rate, activeCurrency)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-[#515154] dark:text-[#A1A1A6]">
                    {b.avg_latency_ms}ms
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.pareto_tier === "frontier"
                        ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                    }`}>
                      {b.pareto_tier.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setShowSimulate(true)}
                        className="px-3 py-1.5 rounded-full bg-white dark:bg-[#242428] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                        title="Simulate prompt with this model"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Simulate</span>
                      </button>

                      <button
                        onClick={() => handleSetPrimary(b)}
                        className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#242428] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                      >
                        {deployedModel === b.model_name ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span>Policy Created!</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 text-[#0050FF]" />
                            <span>Set Primary</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}
    </div>
  );
}
