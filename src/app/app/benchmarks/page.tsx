"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
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
  Check
} from "lucide-react";

export default function BenchmarksPage() {
  const { benchmarks, currency, federationSettings, addRule } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deployedModel, setDeployedModel] = useState<string | null>(null);
  const rate = currency === "INR" ? 86.5 : 1;

  const filteredBenchmarks = benchmarks.filter((b) => {
    const matchesTask = selectedTask === "all" || b.task_type.toLowerCase().includes(selectedTask);
    const matchesSearch =
      b.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTask && matchesSearch;
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

        {/* Task Filter Segmented Control */}
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
      </div>

      {/* Feature 4: Federated Consensus Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Federated Thompson Sampling Consensus
            </h4>
            <p className="text-[11px] text-[#86868B]">
              Active prior blending across <strong>{federationSettings.totalTenants} enterprise SaaS workloads</strong> (Differential Privacy ε=0.5).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] font-semibold">
            Cold-Start Calibrated: 99.4% Ready
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
        <input
          type="text"
          placeholder="Search models (e.g. Claude 3.5, DeepSeek, Groq, GPT-4o)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/30 transition-all shadow-xs"
        />
      </div>

      {/* Model Performance Leaderboard Card */}
      <div className="rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">Pareto Frontier Model Leaderboard</h3>
            <p className="text-xs text-[#86868B]">Dynamic Thompson Sampling Score (Win Rate vs. Unit Cost vs. Latency SLA)</p>
          </div>
          <span className="text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 px-3 py-1 rounded-full">
            {filteredBenchmarks.length} Models Benchmarked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] dark:bg-[#1A1A1E] text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
              <tr>
                <th className="p-4 pl-6 font-medium">Model & Provider</th>
                <th className="p-4 font-medium">Task Domain</th>
                <th className="p-4 font-medium">Win Rate</th>
                <th className="p-4 font-medium text-right">Cost / Outcome</th>
                <th className="p-4 font-medium text-center">Avg Latency</th>
                <th className="p-4 font-medium text-center">Pareto Tier</th>
                <th className="p-4 pr-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F7] dark:divide-white/[0.06]">
              {filteredBenchmarks.map((b, idx) => (
                <tr key={idx} className="hover:bg-[#FBFBFD] dark:hover:bg-[#1E1E22] transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{b.model_name}</span>
                      <span className="text-[10px] text-[#86868B] uppercase px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#1F1F23]">
                        {b.provider}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[#515154] dark:text-[#A1A1A6] capitalize">{b.task_type.replace("_", " ")}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5 max-w-[140px]">
                      <div className="w-full bg-[#F5F5F7] dark:bg-[#1F1F23] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0050FF] h-full rounded-full"
                          style={{ width: `${b.win_rate_pct}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{b.win_rate_pct}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {currency === "INR" ? `₹${(b.cost_per_outcome_usd * rate).toFixed(3)}` : `$${b.cost_per_outcome_usd.toFixed(4)}`}
                  </td>
                  <td className="p-4 text-center font-mono text-[#515154] dark:text-[#A1A1A6]">
                    {b.avg_latency_ms}ms
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.pareto_tier === "frontier"
                        ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                        : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B]"
                    }`}>
                      {b.pareto_tier === "frontier" ? "Frontier (Optimal)" : "Suboptimal"}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleSetPrimary(b)}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] transition-all"
                    >
                      {deployedModel === b.model_name ? "Rule Created ✓" : "Set as Priority"}
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
