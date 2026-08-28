"use client";

import { useState } from "react";
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
  Layers
} from "lucide-react";

export default function BenchmarksPage() {
  const { benchmarks, currency, federationSettings, setFederationWeight, addRule, recordOutcome } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"win_rate" | "cost" | "latency" | "thompson">("win_rate");
  const [deployedModel, setDeployedModel] = useState<string | null>(null);
  
  // Synthetic Batch Test State
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);

  const rate = currency === "INR" ? 86.5 : 1;

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
      const candidates = [
        { model: "DeepSeek Coder", task: "Python Fast API Streaming", pass: true, latency: 112, score: 0.96 },
        { model: "Claude 3.5 Sonnet", task: "Cold Outreach High Intent", pass: true, latency: 145, score: 0.94 },
        { model: "Groq Llama 3.3", task: "FAQ Micro-SLA Resolution", pass: true, latency: 78, score: 0.98 },
        { model: "DeepSeek-V3", task: "Multi-Step SQL Reasoning", pass: true, latency: 95, score: 0.91 },
        { model: "GPT-4o", task: "Complex Financial Audit", pass: true, latency: 480, score: 0.89 }
      ];

      candidates.forEach((c) => {
        recordOutcome(c.model, c.pass);
      });

      setBatchResults(candidates);
      setIsRunningBatch(false);
    }, 1200);
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Outcome Benchmarks & Pareto Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Thompson sampling win rates calibrated across 10+ LLMs with Bayesian consensus
          </p>
        </div>

        {/* Task Filter Segmented Control & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
            {[
              { id: "all", label: "All Tasks" },
              { id: "sales", label: "Sales" },
              { id: "code", label: "Code" },
              { id: "support", label: "Support" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTask(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  selectedTask === tab.id
                    ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRunSyntheticBatch}
            disabled={isRunningBatch}
            className="px-3.5 py-1.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-xs flex items-center gap-1.5"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>{isRunningBatch ? "Evaluating 5 LLMs..." : "Run Batch Eval"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.12] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#1F1F23] transition-all flex items-center gap-1.5"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Synthetic Batch Results Banner */}
      {batchResults && (
        <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0050FF] dark:text-[#3374FF] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Synthetic Bayesian Prior Recalibration Complete (5 LLMs Evaluated)
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Pass Rate</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
            {batchResults.map((r, i) => (
              <div key={i} className="p-2 rounded-xl bg-white dark:bg-[#161618] border border-black/[0.04] dark:border-white/[0.06]">
                <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block truncate">{r.model}</span>
                <span className="text-[#86868B] block">{r.latency}ms · {(r.score * 100).toFixed(0)}% Score</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature 4: Federated Consensus Banner with Weight Slider */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Federated Thompson Sampling Active
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] text-[10px] font-bold">
                ε = {federationSettings.epsilon} (DP Safe)
              </span>
            </div>
            <p className="text-[11px] text-[#86868B]">
              Blending your local tenant wins with consensus across {federationSettings.totalTenants}+ SaaS workloads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#86868B]">Consensus Weight:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={federationSettings.weight}
            onChange={(e) => setFederationWeight(parseFloat(e.target.value))}
            className="w-24 accent-[#0050FF]"
          />
          <span className="text-xs font-bold font-mono text-[#0050FF] dark:text-[#3374FF]">
            {Math.round(federationSettings.weight * 100)}%
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#86868B]" />
          <input
            type="text"
            placeholder="Search model or provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-full bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.12] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-[#86868B]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="h-8 px-3 rounded-full bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.12] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
          >
            <option value="win_rate">Win Rate (Highest)</option>
            <option value="thompson">Thompson Score</option>
            <option value="cost">Cost (Lowest)</option>
            <option value="latency">Latency (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/[0.05] dark:border-white/[0.08] bg-[#FBFBFD] dark:bg-[#1F1F23]/40 text-[#86868B]">
                <th className="py-3 px-5 font-semibold">Model & Provider</th>
                <th className="py-3 px-4 font-semibold">Task Domain</th>
                <th className="py-3 px-4 font-semibold">Outcome Win Rate</th>
                <th className="py-3 px-4 font-semibold">Thompson Score</th>
                <th className="py-3 px-4 font-semibold">P95 Latency</th>
                <th className="py-3 px-4 font-semibold">Cost / Outcome</th>
                <th className="py-3 px-4 font-semibold">Pareto Tier</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {filteredBenchmarks.map((b, idx) => (
                <tr key={idx} className="hover:bg-[#F5F5F7]/50 dark:hover:bg-[#1F1F23]/50 transition-all">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                      <span>{b.model_name}</span>
                      {b.pareto_tier === "frontier" && (
                        <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#86868B] uppercase tracking-wider">{b.provider}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#515154] dark:text-[#A1A1A6]">
                    {b.task_type}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C30] overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${b.win_rate * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {(b.win_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-bold font-mono text-[#0050FF] dark:text-[#3374FF]">
                    {b.thompson_score.toFixed(3)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#515154] dark:text-[#A1A1A6]">
                    {b.avg_latency_ms}ms
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(b.cost_per_outcome_usd * rate, currency)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.pareto_tier === "frontier"
                          ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                          : "bg-[#F5F5F7] dark:bg-[#2C2C30] text-[#86868B]"
                      }`}
                    >
                      {b.pareto_tier === "frontier" ? "Pareto Frontier" : "Suboptimal"}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleSetPrimary(b)}
                      className="px-3 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] dark:hover:text-[#3374FF] font-semibold text-[11px] transition-all"
                    >
                      {deployedModel === b.model_name ? "Policy Deployed!" : "Set as Priority"}
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
