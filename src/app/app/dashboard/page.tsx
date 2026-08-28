"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingDown,
  Coins,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  Play,
  Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

const SpendAreaChart = dynamic(
  () => import("@/components/SpendAreaChart").then((mod) => mod.SpendAreaChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full flex items-center justify-center bg-[#FBFBFD] dark:bg-[#161618] rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] animate-pulse">
        Loading chart metrics...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { currency, monthlySpendUSD, baselineSpendUSD, telemetryLogs, autopilot } = useAppStore();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [showSimulate, setShowSimulate] = useState(false);
  const rate = currency === "INR" ? 86.5 : 1;

  const currentSpend = monthlySpendUSD * rate;
  const baselineSpend = baselineSpendUSD * rate;
  const savedAmount = baselineSpend > currentSpend ? baselineSpend - currentSpend : 0;
  const isFreshAccount = currentSpend === 0 && telemetryLogs.length === 0;

  // Daily spend trend data
  const spendTrendData = [
    { day: "Day 1", baseline: isFreshAccount ? 0 : 62 * rate, actual: isFreshAccount ? 0 : 36 * rate, savings: isFreshAccount ? 0 : 26 * rate },
    { day: "Day 2", baseline: isFreshAccount ? 0 : 68 * rate, actual: isFreshAccount ? 0 : 39 * rate, savings: isFreshAccount ? 0 : 29 * rate },
    { day: "Day 3", baseline: isFreshAccount ? 0 : 74 * rate, actual: isFreshAccount ? 0 : 41 * rate, savings: isFreshAccount ? 0 : 33 * rate },
    { day: "Day 4", baseline: isFreshAccount ? 0 : 80 * rate, actual: isFreshAccount ? 0 : 44 * rate, savings: isFreshAccount ? 0 : 36 * rate },
    { day: "Day 5", baseline: isFreshAccount ? 0 : 92 * rate, actual: isFreshAccount ? 0 : 51 * rate, savings: isFreshAccount ? 0 : 41 * rate },
    { day: "Day 6", baseline: isFreshAccount ? 0 : 98 * rate, actual: isFreshAccount ? 0 : 55 * rate, savings: isFreshAccount ? 0 : 43 * rate },
    { day: "Today", baseline: baselineSpend, actual: currentSpend, savings: savedAmount }
  ];

  // Model traffic distribution
  const modelShareData = [
    { name: "DeepSeek (V3 & Coder)", share: isFreshAccount ? 0 : 46, cost: "$0.0006/req", savings: "88%" },
    { name: "Claude 3.5 Sonnet", share: isFreshAccount ? 0 : 28, cost: "$0.0034/req", savings: "35%" },
    { name: "Groq Llama 3.3", share: isFreshAccount ? 0 : 16, cost: "$0.00018/req", savings: "96%" },
    { name: "GPT-4o (Fallback)", share: isFreshAccount ? 0 : 10, cost: "$0.0052/req", savings: "0%" }
  ];

  // Outcome win rates
  const outcomeWinRates = [
    { task: "Sales Email Outreach", winRate: 93.4, model: "Claude 3.5 Sonnet", metric: "Demo Booked" },
    { task: "Code Review & PRs", winRate: 92.1, model: "DeepSeek Coder", metric: "Code Merged" },
    { task: "Customer Support FAQ", winRate: 96.2, model: "Groq Llama 3.3", metric: "Ticket Resolved" }
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Spend Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Real-time outcome optimization and budget pacing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Time Range */}
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  timeRange === r
                    ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "Quarter"}
              </button>
            ))}
          </div>

          <Link
            href="/app/routing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#8E8E93] hover:text-[#1D1D1F] shadow-xs transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#0050FF]" />
            <span>Auto-Pilot: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">{autopilot.mode}</strong></span>
          </Link>
        </div>
      </div>

      {/* Fresh Account Onboarding Banner */}
      {isFreshAccount && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#EEF4FF] to-white dark:from-[#0050FF]/15 dark:to-[#161618] border border-[#0050FF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#0050FF] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Ready for Live Inference & Routing
              </h3>
              <p className="text-xs text-[#86868B]">
                Your account is active. Run a prompt simulation or connect your API key to view real-time spend analytics.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSimulate(true)}
            className="px-4 py-2 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25 flex items-center gap-1.5 transition-all"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Simulate First Request</span>
          </button>
        </div>
      )}

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Net Savings</span>
            <div className="h-7 w-7 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0050FF] dark:text-[#3374FF] font-mono">
              +{formatCurrency(savedAmount, currency)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <ArrowDownRight className="h-3 w-3" />
              <span>{isFreshAccount ? "Zero spend recorded" : "42.0% less spend than GPT-4o"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Actual AI Spend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Month-to-Date Spend</span>
            <div className="h-7 w-7 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center">
              <Coins className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              {formatCurrency(currentSpend, currency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              Ceiling: {formatCurrency(1500 * rate, currency)}/mo
            </div>
          </div>
        </div>

        {/* Card 3: Avg Outcome Win Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Outcome Win Rate</span>
            <div className="h-7 w-7 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              {isFreshAccount ? "100.0%" : "93.4%"}
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              {isFreshAccount ? "Priors calibrated across 10+ models" : "+12.2% vs single-model setup"}
            </div>
          </div>
        </div>

        {/* Card 4: Avg Gateway Latency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Gateway P95 Latency</span>
            <div className="h-7 w-7 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              184ms
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
              <ArrowDownRight className="h-3 w-3" />
              <span>SLA Target: &lt;200ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card: Actual Spend vs. Baseline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
              Spend Pacing & Cumulative Savings
            </h3>
            <p className="text-xs text-[#86868B]">
              Actual routed spend (solid blue) vs. GPT-4o un-routed baseline (dashed)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#0050FF]"></span>
              <span className="text-[#515154] dark:text-[#8E8E93]">Actual Spend</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D2D2D7] dark:bg-[#3A3A3C]"></span>
              <span className="text-[#515154] dark:text-[#8E8E93]">Un-routed Baseline</span>
            </div>
          </div>
        </div>

        <SpendAreaChart data={spendTrendData} />
      </div>

      {/* 2-Column Grid: Model Share & Recent Verified Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Traffic Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
              Model Traffic Distribution
            </h3>
            <span className="text-xs text-[#86868B]">Autonomous Multi-Model</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {modelShareData.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{m.name}</span>
                    <span className="text-[10px] text-[#86868B] font-mono">{m.cost}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{m.savings} saved</span>
                    <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">{m.share}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F5F7] dark:bg-[#1F1F23] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0050FF] h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.share}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome Win Rates by Domain */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
              Outcome Win Rates by Domain
            </h3>
            <Link href="/app/benchmarks" className="text-xs text-[#0050FF] dark:text-[#3374FF] font-medium hover:underline">
              View Leaderboard →
            </Link>
          </div>

          <div className="divide-y divide-[#F5F5F7] dark:divide-white/[0.06]">
            {outcomeWinRates.map((o, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <div className="font-medium text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{o.task}</div>
                  <div className="text-[11px] text-[#86868B] flex items-center gap-2 mt-0.5">
                    <span>Optimal: {o.model}</span>
                    <span>•</span>
                    <span>Target: {o.metric}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-[#E6F4EA] dark:bg-[#1E3A2F] px-2.5 py-1 rounded-full font-mono">
                    <CheckCircle2 className="h-3 w-3" />
                    {o.winRate}% Win
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </div>
  );
}
