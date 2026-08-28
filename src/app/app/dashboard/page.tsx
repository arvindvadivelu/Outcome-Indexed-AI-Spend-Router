"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingDown,
  Layers,
  Coins,
  ArrowDownRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  SlidersHorizontal
} from "lucide-react";
import dynamic from "next/dynamic";

const SpendAreaChart = dynamic(
  () => import("@/components/SpendAreaChart").then((mod) => mod.SpendAreaChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full flex items-center justify-center bg-[#FBFBFD] rounded-xl border border-black/[0.04] text-xs text-[#86868B] animate-pulse">
        Loading chart metrics...
      </div>
    ),
  }
);
import Link from "next/link";

export default function DashboardPage() {
  const { currency, monthlySpendUSD, baselineSpendUSD, telemetryLogs, autopilot } = useAppStore();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const rate = currency === "INR" ? 86.5 : 1;

  const currentSpend = monthlySpendUSD * rate;
  const baselineSpend = baselineSpendUSD * rate;
  const savedAmount = baselineSpend - currentSpend;

  // Daily spend trend data
  const spendTrendData = [
    { day: "Aug 20", baseline: 62 * rate, actual: 36 * rate, savings: 26 * rate },
    { day: "Aug 21", baseline: 68 * rate, actual: 39 * rate, savings: 29 * rate },
    { day: "Aug 22", baseline: 74 * rate, actual: 41 * rate, savings: 33 * rate },
    { day: "Aug 23", baseline: 80 * rate, actual: 44 * rate, savings: 36 * rate },
    { day: "Aug 24", baseline: 92 * rate, actual: 51 * rate, savings: 41 * rate },
    { day: "Aug 25", baseline: 98 * rate, actual: 55 * rate, savings: 43 * rate },
    { day: "Aug 26", baseline: 104 * rate, actual: 58 * rate, savings: 46 * rate }
  ];

  // Model traffic distribution
  const modelShareData = [
    { name: "DeepSeek (V3 & Coder)", share: 46, cost: "$0.0006/req", savings: "88%" },
    { name: "Claude 3.5 Sonnet", share: 28, cost: "$0.0034/req", savings: "35%" },
    { name: "Groq Llama 3.3", share: 16, cost: "$0.00018/req", savings: "96%" },
    { name: "GPT-4o (Fallback)", share: 10, cost: "$0.0052/req", savings: "0%" }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Spend Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Real-time outcome optimization and budget pacing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Time Range */}
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7]">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  timeRange === r
                    ? "bg-white text-[#1D1D1F] shadow-sm"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "Quarter"}
              </button>
            ))}
          </div>

          <Link
            href="/app/routing"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-white border border-black/[0.06] text-[#515154] hover:text-[#1D1D1F] shadow-sm transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#0050FF]" />
            <span>Auto-Pilot: <strong className="text-[#1D1D1F] capitalize">{autopilot.mode}</strong></span>
          </Link>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Savings */}
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Net Savings</span>
            <div className="h-7 w-7 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0050FF] font-mono">
              +{formatCurrency(savedAmount, currency)}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <ArrowDownRight className="h-3 w-3" />
              <span>42.0% less spend than GPT-4o</span>
            </div>
          </div>
        </div>

        {/* Card 2: Actual AI Spend */}
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Current Spend</span>
            <div className="h-7 w-7 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center">
              <Coins className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
              {formatCurrency(currentSpend, currency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              Ceiling: {formatCurrency(1500 * rate, currency)}/mo
            </div>
          </div>
        </div>

        {/* Card 3: Avg Outcome Win Rate */}
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">Avg Win Rate</span>
            <div className="h-7 w-7 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
              93.4%
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              Across all verified conversions
            </div>
          </div>
        </div>

        {/* Card 4: P95 Latency */}
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#86868B]">
            <span className="font-medium">P95 Latency</span>
            <div className="h-7 w-7 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
              184ms
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              Speculative racing active
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-base">Spend vs. Unoptimized Baseline</h3>
            <p className="text-xs text-[#86868B]">Comparing actual routed cost with default GPT-4o token pricing</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0050FF]"></span>
              <span className="text-[#515154] font-medium">Actual Cost</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D2D2D7]"></span>
              <span className="text-[#86868B]">GPT-4o Baseline</span>
            </div>
          </div>
        </div>

        <SpendAreaChart data={spendTrendData} />
      </div>

      {/* 2-Column Grid: Model Share & Recent Verified Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Col 1: Model Traffic Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Model Traffic Distribution</h3>
            <span className="text-xs text-[#86868B]">Auto-Balanced</span>
          </div>

          <div className="space-y-3">
            {modelShareData.map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1D1D1F]">{m.name}</span>
                    <span className="text-[10px] text-[#86868B]">{m.cost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-600 font-semibold">-{m.savings}</span>
                    <span className="font-semibold text-[#1D1D1F] w-8 text-right">{m.share}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0050FF] h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.share}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: High-Performing Task Domains */}
        <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Outcome Win Rates by Task</h3>
            <Link href="/app/benchmarks" className="text-xs text-[#0050FF] hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="divide-y divide-[#F5F5F7]">
            {outcomeWinRates.map((t, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#1D1D1F]">{t.task}</p>
                  <p className="text-[11px] text-[#86868B]">
                    Primary: {t.model} • Target: {t.metric}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-1 rounded-full">
                    {t.winRate}% Win
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
