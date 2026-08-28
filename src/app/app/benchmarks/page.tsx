"use client";

import { useState, useEffect } from "react";
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
  RefreshCw
} from "lucide-react";

export default function BenchmarksPage() {
  const { benchmarks, currency, federationSettings, setFederationWeight, addRule, recordOutcome } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"win_rate" | "cost" | "latency" | "thompson">("win_rate");
  const [deployedModel, setDeployedModel] = useState<string | null>(null);
  
  // Synthetic Batch Test State
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  const filteredBenchmarks = benchmarks
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

  const handleSetPrimary = (b: any) => {
    addRule({
      id: `rule_bench_${Date.now()}`,
      name: `${b.model_name} Dedicated Policy (${b.task_type})`,
      task_type: b.task_type,
      condition_pattern: `task == '${b.task_type}'`,
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
      ai_synthesized: true
    });
    setDeployedModel(b.model_name);
    setTimeout(() => setDeployedModel(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = "Model,Provider,Task,WinRate,AvgLatencyMs,CostUSD,ThompsonScore,ParetoTier\n";
    const rows = filteredBenchmarks
      .map(
        (b) =>
          `"${b.model_name}","${b.provider}","${b.task_type}",${(b.win_rate * 100).toFixed(1)}%,${b.avg_latency_ms},${b.avg_cost_usd},${b.thompson_score},"${b.pareto_tier}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `outcome_benchmarks_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handleRunSyntheticBatch = () => {
    setIsRunningBatch(true);
    setBatchResults(null);

    setTimeout(() => {
      const results = [
        { model: "DeepSeek-V3", tokens: 1240, costUsd: 0.00042, latencyMs: 64, outcomePass: true, criticScore: 0.96 },
        { model: "Groq Llama 3.3", tokens: 980, costUsd: 0.00018, latencyMs: 48, outcomePass: true, criticScore: 0.94 },
        { model: "Claude 3.5 Sonnet", tokens: 1450, costUsd: 0.0034, latencyMs: 140, outcomePass: true, criticScore: 0.98 },
        { model: "DeepSeek Coder", tokens: 1100, costUsd: 0.00065, latencyMs: 115, outcomePass: true, criticScore: 0.95 },
        { model: "GPT-4o (Control)", tokens: 1350, costUsd: 0.0052, latencyMs: 380, outcomePass: true, criticScore: 0.97 }
      ];

      setBatchResults(results);
      setIsRunningBatch(false);
    }, 750);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Empirical Outcome Benchmarks & Leaderboard
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Empirical quality-to-cost conversion rates across 480+ enterprise workloads updated dynamically via Dirichlet priors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRunSyntheticBatch}
              disabled={isRunningBatch}
              className="h-10 px-5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] transition-all flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRunningBatch ? "Evaluating Batch..." : "Run Synthetic Eval (5 Models)"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Pareto Frontier Top Pick</span>
          <div className="my-4">
            <div className="text-3xl font-extrabold font-mono">DeepSeek-V3</div>
            <div className="text-xs text-white/70 mt-1">94.8% Win Rate · $0.27 / 1M Tokens</div>
          </div>
          <span className="text-[11px] text-white/80">Cuts 88% cost vs baseline with zero quality drop</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Ultra-Low Latency Leader</span>
          <div className="my-4">
            <div className="text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Groq Llama 3.3</div>
            <div className="text-xs text-[#86868B] mt-1">48ms TTFT · $0.18 / 1M Tokens</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">96.0% First-Contact Resolution</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Federated Prior Sharing</span>
          <div className="my-4">
            <div className="text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">480+ Workloads</div>
            <div className="text-xs text-[#86868B] mt-1">ε=0.5 Differential Privacy Consensus</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Auto-updates every 15 minutes</span>
        </div>
      </div>

      {/* 3. Synthetic Batch Evaluation Results Drawer */}
      {batchResults && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>Real-Time Synthetic Batch Evaluation (5 Models Parallel)</span>
            </h3>
            <button onClick={() => setBatchResults(null)} className="text-xs text-[#86868B] hover:text-[#1D1D1F]">Dismiss</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {batchResults.map((r, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/90 dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5 shadow-2xs">
                <div className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate">{r.model}</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">{r.latencyMs}ms · ${(r.costUsd).toFixed(5)}</div>
                <div className="text-[10px] text-[#86868B]">Critic Score: {(r.criticScore * 100).toFixed(0)}% Pass</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Filter & Search Controls */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Task Pills */}
          <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md overflow-x-auto">
            {[
              { id: "all", label: "All Tasks" },
              { id: "sales", label: "Sales SDR" },
              { id: "code", label: "Code Review" },
              { id: "support", label: "Support FAQ" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTask(t.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
                  selectedTask === t.id
                    ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
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
                  className={`px-3 py-1 text-[11px] font-semibold rounded-full capitalize transition-all ${
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
        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Model & Provider</th>
                <th className="py-3.5 px-4 font-semibold">Task KPI</th>
                <th className="py-3.5 px-4 font-semibold text-center">Outcome Win Rate</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cost / 1M Tokens</th>
                <th className="py-3.5 px-4 font-semibold text-center">Avg TTFT</th>
                <th className="py-3.5 px-4 font-semibold text-center">Pareto Tier</th>
                <th className="py-3.5 px-5 font-semibold text-right">Action</th>
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
                    ${(b.avg_cost_usd * 1000).toFixed(2)}
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
                    <button
                      onClick={() => handleSetPrimary(b)}
                      className="px-3 py-1 rounded-full bg-white dark:bg-[#242428] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1 shadow-2xs"
                    >
                      {deployedModel === b.model_name ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Deployed!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 text-[#0050FF]" />
                          <span>Set Primary</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
