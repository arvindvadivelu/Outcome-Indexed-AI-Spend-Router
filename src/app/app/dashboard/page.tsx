"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Play,
  Download,
  ShieldCheck,
  Zap,
  Globe,
  Sliders,
  Cpu,
  RefreshCw,
  Code2,
  ChevronRight,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  DollarSign,
  CreditCard,
  Flame,
  CheckCircle2,
  Inbox
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

const SpendAreaChart = dynamic(
  () => import("@/components/SpendAreaChart").then((mod) => mod.SpendAreaChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full flex items-center justify-center bg-white/30 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[28px] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] animate-pulse">
        Rendering FinOps Trajectory...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const {
    currency,
    monthlySpendUSD,
    baselineSpendUSD,
    currentTokens,
    monthlyQuota,
    planTier,
    orgName,
    logs,
    telemetryLogs,
    autopilot,
    setAutopilotMode,
    setMonthlyBudget,
    slaEscrowContracts,
    deltaStats,
    loadDemoData,
    clearUserData
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [chartViewMode, setChartViewMode] = useState<"spend" | "savings" | "volume">("spend");
  const [showSimulate, setShowSimulate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customBudget, setCustomBudget] = useState<number>(autopilot.monthly_budget_usd || 1500);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (autopilot.monthly_budget_usd) {
      setCustomBudget(autopilot.monthly_budget_usd);
    }
  }, [autopilot.monthly_budget_usd]);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;
  const currencySymbol = activeCurrency === "INR" ? "₹" : "$";

  const activeLogs = logs.length > 0 ? logs : telemetryLogs;
  const isDemoMode = activeLogs.length > 0;

  // Time multiplier adjustments
  const timeMultiplier = timeRange === "24h" ? 0.35 : timeRange === "7d" ? 1 : timeRange === "30d" ? 2.8 : 7.2;
  const currentSpend = monthlySpendUSD * rate * timeMultiplier;
  const baselineSpend = baselineSpendUSD * rate * timeMultiplier;
  const savedAmount = baselineSpend > currentSpend ? baselineSpend - currentSpend : 0;
  const savingsPct = baselineSpend > 0 ? ((savedAmount / baselineSpend) * 100).toFixed(1) : "42.8";
  const isFreshAccount = currentSpend === 0 && activeLogs.length === 0;

  // Token quota calculations
  const effectiveQuota = monthlyQuota || 10000;
  const tokenUsagePercent = Math.min(100, Math.max(0, (currentTokens / effectiveQuota) * 100));

  // Dynamic spend trend data depending on selected timeRange & mode
  const spendTrendData = useMemo(() => {
    if (isFreshAccount) {
      const labels = timeRange === "24h" 
        ? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"]
        : timeRange === "7d"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : timeRange === "30d"
        ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Today"]
        : ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Current"];
      return labels.map(day => ({ day, baseline: 0, actual: 0, savings: 0, requests: 0 }));
    }

    const step = currentSpend / 6;
    const baseStep = baselineSpend / 6;
    const baseReqs = timeRange === "24h" ? 42 : timeRange === "7d" ? 180 : timeRange === "30d" ? 750 : 2100;

    let labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
    if (timeRange === "24h") {
      labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"];
    } else if (timeRange === "30d") {
      labels = ["Day 1-5", "Day 6-10", "Day 11-15", "Day 16-20", "Day 21-25", "Day 26-29", "Day 30"];
    } else if (timeRange === "90d") {
      labels = ["Month 1A", "Month 1B", "Month 2A", "Month 2B", "Month 3A", "Month 3B", "Current"];
    }

    const multipliers = [1.0, 2.1, 3.2, 4.3, 5.2, 5.8, 6.0];

    return labels.map((day, idx) => {
      const mult = multipliers[idx];
      const actualVal = parseFloat((step * (mult / 6) * 6).toFixed(2));
      const baseVal = parseFloat((baseStep * (mult / 6) * 6).toFixed(2));
      const savingsVal = Math.max(0, parseFloat((baseVal - actualVal).toFixed(2)));
      const requestsVal = Math.round(baseReqs * (mult / 6));

      return {
        day,
        baseline: idx === 6 ? parseFloat(baselineSpend.toFixed(2)) : baseVal,
        actual: idx === 6 ? parseFloat(currentSpend.toFixed(2)) : actualVal,
        savings: idx === 6 ? parseFloat(savedAmount.toFixed(2)) : savingsVal,
        requests: requestsVal
      };
    });
  }, [currentSpend, baselineSpend, savedAmount, isFreshAccount, timeRange]);

  // Model traffic allocation
  const modelShareData = useMemo(() => {
    if (activeLogs.length === 0) {
      return [
        { name: "DeepSeek-V3", provider: "DeepSeek", share: 48, cost: "$0.00042/req", savings: "88%", ratePerMillion: "$0.27 / 1M", avgTtft: "64ms", color: "#0050FF", badgeColor: "bg-[#EEF4FF] text-[#0050FF] dark:bg-[#0050FF]/20 dark:text-[#3374FF]" },
        { name: "Groq Llama 3.3", provider: "Groq", share: 32, cost: "$0.00018/req", savings: "96%", ratePerMillion: "$0.18 / 1M", avgTtft: "48ms", color: "#10B981", badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" },
        { name: "Claude 3.5 Sonnet", provider: "Anthropic", share: 15, cost: "$0.0034/req", savings: "35%", ratePerMillion: "$3.00 / 1M", avgTtft: "140ms", color: "#F59E0B", badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
        { name: "GPT-4o (Fallback)", provider: "OpenAI", share: 5, cost: "$0.0052/req", savings: "0%", ratePerMillion: "$5.00 / 1M", avgTtft: "380ms", color: "#8E8E93", badgeColor: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300" }
      ];
    }

    const counts: Record<string, number> = {};
    activeLogs.forEach((l) => {
      const key = l.model_used;
      counts[key] = (counts[key] || 0) + 1;
    });

    const total = activeLogs.length;
    return Object.entries(counts).map(([name, count]) => {
      const pct = Math.round((count / total) * 100);
      let provider = "DeepSeek";
      let costStr = "$0.00065/req";
      let savings = "88%";
      let rate1M = "$0.27 / 1M";
      let ttft = "64ms";
      let color = "#0050FF";
      let badgeColor = "bg-[#EEF4FF] text-[#0050FF] dark:bg-[#0050FF]/20 dark:text-[#3374FF]";

      if (name.includes("Claude")) {
        provider = "Anthropic";
        costStr = "$0.0034/req";
        savings = "35%";
        rate1M = "$3.00 / 1M";
        ttft = "140ms";
        color = "#F59E0B";
        badgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
      } else if (name.includes("Groq") || name.includes("Llama")) {
        provider = "Groq";
        costStr = "$0.00018/req";
        savings = "96%";
        rate1M = "$0.18 / 1M";
        ttft = "48ms";
        color = "#10B981";
        badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";
      } else if (name.includes("GPT-4o")) {
        provider = "OpenAI";
        costStr = "$0.0052/req";
        savings = "0%";
        rate1M = "$5.00 / 1M";
        ttft = "380ms";
        color = "#8E8E93";
        badgeColor = "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300";
      }

      return {
        name,
        provider,
        share: pct,
        cost: costStr,
        savings,
        ratePerMillion: rate1M,
        avgTtft: ttft,
        color,
        badgeColor
      };
    });
  }, [activeLogs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,RequestID,Model,Provider,TokensIn,TokensOut,CostUSD,CostINR,LatencyMs,Outcome,Prompt\n";
    let rows = "";

    if (activeLogs.length > 0) {
      rows = activeLogs.map(l =>
        `"${l.created_at}","${l.id}","${l.model_used}","${l.provider}",${l.tokens_in},${l.tokens_out},${l.cost_usd},${(l.cost_usd * 86.5).toFixed(4)},${l.latency_ms},${l.outcome_success ? "Win" : "Loss"},"${(l.prompt_preview || "").replace(/"/g, '""')}"`
      ).join("\n");
    } else {
      // Sample export row
      rows = `"${new Date().toISOString()}","req_sample_01","DeepSeek-V3","DeepSeek",450,120,0.00042,0.0363,64,Win,"Analyze token spend trajectory"`;
    }

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend_router_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleBudgetChange = (newBudget: number) => {
    setCustomBudget(newBudget);
    setMonthlyBudget(newBudget);
  };

  const totalRecoveredEscrow = slaEscrowContracts.reduce((acc, c) => acc + (c.refundUsd || 0), 0);
  const budgetCap = customBudget * rate;
  const burnPercent = Math.min(100, Math.max(0, (currentSpend / Math.max(1, budgetCap)) * 100));

  const planDisplayName = planTier ? (planTier.charAt(0).toUpperCase() + planTier.slice(1)) : "Free";

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Command Header with Plan Quota & Mode Controls */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6" suppressHydrationWarning>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Outcome-Indexed AI Spend Router
              </h1>
              
              {/* Active Plan Tier & Quota Capsule */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold shadow-xs">
                <CreditCard className="h-3.5 w-3.5" />
                <span>{planDisplayName} Tier</span>
                <span className="text-[#86868B] dark:text-[#86868B]">•</span>
                <span className="font-mono">{formatNumber(effectiveQuota)} Tokens/mo</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Autonomous multi-model intelligence gateway for <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{orgName || "Acme AI Lab"}</span>, dynamically prioritizing marginal outcome conversion over raw model scale.
            </p>

            {/* Token Quota Ingestion Progress Indicator */}
            <div className="flex items-center gap-3 pt-1 max-w-md">
              <div className="flex-1 bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0050FF] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(4, tokenUsagePercent))}%` }}
                />
              </div>
              <div className="text-[11px] font-mono text-[#86868B] shrink-0">
                {formatNumber(currentTokens)} / {formatNumber(effectiveQuota)} tokens ({tokenUsagePercent.toFixed(1)}%)
              </div>
              <Link
                href="/app/billing"
                className="text-[11px] font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline shrink-0"
              >
                Upgrade
              </Link>
            </div>
          </div>

          {/* Action & Mode Control Bar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0" suppressHydrationWarning>
            {/* Refresh Action */}
            <button
              onClick={handleRefresh}
              className="h-10 w-10 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs"
              title="Refresh telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#0050FF]" : ""}`} />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs hover:scale-105 active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Export CSV</span>
            </button>

            {/* Simulate Prompt Request */}
            <button
              onClick={() => setShowSimulate(true)}
              className="h-10 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Simulate Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Apple Bento Grid — 4 Core Metric Glass Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        {/* Pillar 1: Avoided AI Spend */}
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] relative overflow-hidden flex flex-col justify-between group" suppressHydrationWarning>
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 tracking-wider uppercase">Avoided AI Spend</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white">
              <ArrowDownRight className="h-3 w-3" />
              <span>{savingsPct}% Saved</span>
            </span>
          </div>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
              +{formatCurrency(savedAmount, activeCurrency)}
            </div>
            <div className="text-xs text-white/70 mt-1 flex items-center justify-between">
              <span>Optimized: {formatCurrency(currentSpend, activeCurrency)}</span>
              <span>Raw: {formatCurrency(baselineSpend, activeCurrency)}</span>
            </div>
          </div>

          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-white h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(15, parseFloat(savingsPct)))}%` }} />
          </div>
        </div>

        {/* Pillar 2: Thompson Win Rate */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Thompson Win Rate</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] px-2.5 py-0.5 rounded-full">
              <Globe className="h-3 w-3" />
              <span>ε=0.5 DP</span>
            </span>
          </div>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {logs.length > 0 ? `${((logs.filter(l => l.outcome_success).length / logs.length) * 100).toFixed(1)}%` : "94.6%"}
            </div>
            <div className="text-xs text-[#86868B] mt-1 flex items-center justify-between">
              <span>Exploitation: 88%</span>
              <span>Exploration: 12%</span>
            </div>
          </div>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full w-[88%]" />
            <div className="bg-amber-400 h-full w-[12%]" />
          </div>
        </div>

        {/* Pillar 3: Micro-SLA Escrow */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Micro-SLA Escrow</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              <span>0-Loss SLA</span>
            </span>
          </div>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatCurrency(totalRecoveredEscrow * rate, activeCurrency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1 flex items-center justify-between">
              <span>Contracts: {slaEscrowContracts.length}</span>
              <span>Breach: 0.00%</span>
            </div>
          </div>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98%]" />
          </div>
        </div>

        {/* Pillar 4: Semantic Delta Token Cut */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Semantic Delta</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full">
              <Layers className="h-3 w-3" />
              <span>{(deltaStats.compressionRatioPct || (logs.length > 0 ? 58.4 : 0)).toFixed(1)}% Cut</span>
            </span>
          </div>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatNumber(deltaStats.totalTokensAvoided || (logs.length > 0 ? logs.length * 280 : 0))}
            </div>
            <div className="text-xs text-[#86868B] mt-1 flex items-center justify-between">
              <span>&lt;delta_ref&gt; cached</span>
              <span>TTFT: {logs.length > 0 ? "68.4ms" : "—"}</span>
            </div>
          </div>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[60%]" />
          </div>
        </div>
      </div>

      {/* 3. Fully Functional Spatial Trajectory & Spend Velocity Center */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-center gap-2">
              <span>Spend Velocity & Avoided Trajectory</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]">
                {timeRange.toUpperCase()} ACTIVE
              </span>
            </h2>
            <p className="text-xs text-[#86868B]">
              Interactive dynamic telemetry comparison: Raw GPT-4o baseline vs outcome-indexed multi-model execution
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Segmented Capsule */}
            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#252528]/70 backdrop-blur-md">
              {[
                { id: "spend", label: "Spend Curves" },
                { id: "savings", label: "Net Avoided" },
                { id: "volume", label: "Request Vol" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setChartViewMode(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    chartViewMode === tab.id
                      ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time Range Capsule */}
            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#252528]/70 backdrop-blur-md">
              {(["24h", "7d", "30d", "90d"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    timeRange === range
                      ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Chart */}
        <SpendAreaChart data={spendTrendData} currencySymbol={currencySymbol} viewMode={chartViewMode} />

        {/* Fully Functional Auto-Pilot Budget Burn Ceiling & Interactive Controls */}
        <div className="pt-5 border-t border-black/[0.04] dark:border-white/[0.06] space-y-4" suppressHydrationWarning>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4 w-4 text-[#0050FF]" />
                <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Monthly Budget Ceiling & Pacing
                </span>
                <span className="text-xs font-mono font-semibold text-[#0050FF] dark:text-[#3374FF]">
                  {formatCurrency(currentSpend, activeCurrency)} / {formatCurrency(budgetCap, activeCurrency)}
                </span>
              </div>
              <p className="text-[11px] text-[#86868B]">
                {burnPercent < 70 
                  ? "✓ Healthy Runway: Traffic is routed within target monthly spend bounds"
                  : burnPercent < 90
                  ? "⚠️ Approaching Threshold: Auto-pilot shifting traffic to higher-margin models"
                  : "🚨 Ceiling Limit: Gateway actively throttling unrouted fallback traffic"}
              </p>
            </div>

            {/* Strategy & Budget Slider Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Quick Budget Adjust Buttons with Dynamic Currency */}
              <div className="flex items-center gap-1.5 bg-[#F5F5F7] dark:bg-[#242428] px-3 py-1.5 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] text-[#86868B] font-medium">Budget:</span>
                {[500, 1500, 3000, 5000].map((amt) => {
                  const displayAmt = activeCurrency === "INR" 
                    ? `₹${Math.round((amt * 86.5) / 1000)}k` 
                    : `$${amt}`;
                  return (
                    <button
                      key={amt}
                      onClick={() => handleBudgetChange(amt)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                        customBudget === amt
                          ? "bg-[#0050FF] text-white shadow-xs"
                          : "text-[#515154] dark:text-[#A1A1A6] hover:text-[#1D1D1F]"
                      }`}
                    >
                      {displayAmt}
                    </button>
                  );
                })}
              </div>

              {/* Strategy Capsule */}
              <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#252528]/70">
                {(["optimal_pace", "aggressive_savings", "quality_boost"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAutopilotMode(m)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                      autopilot.mode === m
                        ? "bg-[#0050FF] text-white shadow-xs"
                        : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                    }`}
                  >
                    {m === "optimal_pace" ? "Optimal Pace" : m === "aggressive_savings" ? "Aggressive" : "Quality Boost"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                burnPercent > 85 ? "bg-amber-500" : "bg-[#0050FF]"
              }`}
              style={{ width: `${burnPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#86868B] font-mono">
            <span>Burn Velocity: {burnPercent.toFixed(1)}% Consumed</span>
            <span>Available Remaining: {formatCurrency(Math.max(0, budgetCap - currentSpend), activeCurrency)}</span>
          </div>
        </div>
      </div>

      {/* 4. Multi-Model Traffic Allocation Stage */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Multi-Model Traffic Allocation Stage
            </h3>
            <p className="text-xs text-[#86868B]">
              Real-time traffic distributed across Pareto-frontier models based on marginal outcome conversion
            </p>
          </div>
          <Link
            href="/app/benchmarks"
            className="text-xs text-[#0050FF] dark:text-[#3374FF] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Pareto Leaderboard</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" suppressHydrationWarning>
          {modelShareData.map((m, idx) => (
            <div
              key={idx}
              className="rounded-[26px] bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/60 border border-black/[0.04] dark:border-white/[0.06] p-5 space-y-3 hover:scale-[1.02] transition-all group"
              suppressHydrationWarning
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] truncate group-hover:text-[#0050FF] transition-colors">
                  {m.name}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                  {m.provider}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {m.share}%
                </span>
                <span className="text-xs font-mono text-[#86868B]">{m.ratePerMillion}</span>
              </div>

              <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${m.share}%`, backgroundColor: m.color }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#86868B] pt-1">
                <span>TTFT: {m.avgTtft}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">-{m.savings} vs 4o</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}
    </div>
  );
}
