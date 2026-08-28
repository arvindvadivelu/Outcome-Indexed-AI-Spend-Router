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
  ShieldCheck
} from "lucide-react";

export default function BenchmarksPage() {
  const { modelBenchmarks, currency, federationSettings } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<string>("all");
  const rate = currency === "INR" ? 86.5 : 1;

  const filteredBenchmarks = modelBenchmarks.filter(
    (b) => selectedTask === "all" || b.task_type.toLowerCase().includes(selectedTask)
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Outcome Benchmarks & Federated Priors
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Model performance, win rates, and cross-tenant federated consensus
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
              Active blend across <strong>{federationSettings.totalTenants} enterprise workloads</strong> (Differential Privacy ε=0.5).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] font-semibold">
            Cold-Start Jumpstart: Active (95%+ Ready)
          </span>
        </div>
      </div>

      {/* Model Performance Leaderboard Card */}
      <div className="rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">Model Leaderboard</h3>
            <p className="text-xs text-[#86868B]">Ordered by Pareto Score (Win Rate vs. Cost vs. Latency)</p>
          </div>
          <span className="text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 px-3 py-1 rounded-full">
            {filteredBenchmarks.length} Models
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] dark:bg-[#1A1A1E] text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
              <tr>
                <th className="p-4 pl-6 font-medium">Model & Provider</th>
                <th className="p-4 font-medium">Task Domain</th>
                <th className="p-4 font-medium">Outcome Win Rate</th>
                <th className="p-4 font-medium text-right">Cost / Outcome</th>
                <th className="p-4 font-medium text-center">Avg Latency</th>
                <th className="p-4 pr-6 font-medium text-right">Status</th>
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
                  <td className="p-4 pr-6 text-right">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      b.pareto_tier === "frontier"
                        ? "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]"
                        : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B]"
                    }`}>
                      {b.pareto_tier === "frontier" ? "Optimal" : "Fallback"}
                    </span>
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
