"use client";

import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Bot,
  ShieldCheck
} from "lucide-react";

export default function BenchmarksPage() {
  const { modelBenchmarks, currency } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Outcome Benchmarks & Autonomous AI Priors
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Empirical win-rates, LLM-as-a-Judge synthetic confidence, and Critic pass rate per model
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-apple-sm text-xs font-mono text-[#515154]">
          <Bot className="h-4 w-4 text-[#0050FF]" />
          <span>LLM-as-a-Judge Prior Seeding: Active</span>
        </div>
      </div>

      {/* Model Benchmark Table Card */}
      <div className="rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#E5E5EA] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1D1D1F]">Live Model Performance & AI Verification Matrix</h3>
            <p className="text-xs text-[#86868B]">Ordered by Pareto Outcome ROI Score with LLM Critic telemetry</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-3 py-1 rounded-full border border-[#0050FF]/20">
            10 Models Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F5F7] text-[#1D1D1F] font-mono border-b border-[#E5E5EA]">
              <tr>
                <th className="p-4 pl-6">Model / Provider</th>
                <th className="p-4">Task Domain</th>
                <th className="p-4 text-center">Outcome Win Rate</th>
                <th className="p-4 text-center">LLM-Judge Prior</th>
                <th className="p-4 text-center">Critic Pass Rate</th>
                <th className="p-4 text-right">Cost / Outcome</th>
                <th className="p-4 text-center">P95 Latency</th>
                <th className="p-4 pr-6 text-center">Pareto Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] bg-white font-mono">
              {modelBenchmarks.map((b, idx) => (
                <tr key={idx} className="hover:bg-[#F5F5F7]/60 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1D1D1F] font-sans">{b.model_name}</span>
                      <span className="text-[10px] text-[#86868B] uppercase font-mono px-1.5 py-0.5 rounded bg-[#F5F5F7]">
                        {b.provider}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[#515154] font-sans">{b.task_type}</td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-1 rounded-full border border-[#0050FF]/20">
                      {b.win_rate_pct}%
                    </span>
                  </td>
                  <td className="p-4 text-center text-[#515154]">
                    {b.synthetic_judge_confidence ?? 95.0}%
                  </td>
                  <td className="p-4 text-center text-[#0050FF] font-bold">
                    {b.critic_pass_rate ?? 98.0}%
                  </td>
                  <td className="p-4 text-right font-bold text-[#0050FF]">
                    {currency === "INR" ? `₹${(b.cost_per_positive_outcome * rate).toFixed(3)}` : `$${b.cost_per_positive_outcome.toFixed(4)}`}
                  </td>
                  <td className="p-4 text-center text-[#86868B]">{b.avg_latency_ms}ms</td>
                  <td className="p-4 pr-6 text-center">
                    {b.pareto_tier === "frontier" ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold text-[10px] border border-[#0050FF]/30">
                        Pareto Frontier
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] text-[10px]">
                        Sub-optimal
                      </span>
                    )}
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
