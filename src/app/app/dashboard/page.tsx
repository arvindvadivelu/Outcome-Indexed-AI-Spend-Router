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
  Sparkles,
  Download,
  RotateCcw,
  Database,
  ShieldCheck,
  Zap,
  Bot,
  Activity,
  Layers,
  Globe,
  Sliders,
  Cpu,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Code2,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Radio,
  Clock,
  Coins
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
        Rendering Apple Spatial Telemetry...
      </div>
    ),
  }
);

export default function DashboardPage() {
  const {
    currency,
    monthlySpendUSD,
    baselineSpendUSD,
    logs,
    telemetryLogs,
    autopilot,
    setAutopilotMode,
    slaEscrowContracts,
    deltaStats,
    prewarmMetrics,
    federationSettings,
    loadDemoData,
    clearUserData,
    recordOutcome,
    addRule
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [chartViewMode, setChartViewMode] = useState<"spend" | "savings" | "volume">("spend");
  const [showSimulate, setShowSimulate] = useState(false);
  const [copiedCurlId, setCopiedCurlId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [advisorApplied, setAdvisorApplied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;
  const currencySymbol = activeCurrency === "INR" ? "₹" : "$";

  const activeLogs = logs.length > 0 ? logs : telemetryLogs;

  const currentSpend = monthlySpendUSD * rate * (timeRange === "24h" ? 0.35 : timeRange === "7d" ? 1 : timeRange === "30d" ? 2.8 : 7.2);
  const baselineSpend = baselineSpendUSD * rate * (timeRange === "24h" ? 0.35 : timeRange === "7d" ? 1 : timeRange === "30d" ? 2.8 : 7.2);
  const savedAmount = baselineSpend > currentSpend ? baselineSpend - currentSpend : 0;
  const savingsPct = baselineSpend > 0 ? ((savedAmount / baselineSpend) * 100).toFixed(1) : "42.8";
  const isFreshAccount = currentSpend === 0 && activeLogs.length === 0;

  // Dynamic daily spend trend data
  const spendTrendData = useMemo(() => {
    if (isFreshAccount) {
      return [
        { day: "Mon", baseline: 0, actual: 0, savings: 0, requests: 0 },
        { day: "Tue", baseline: 0, actual: 0, savings: 0, requests: 0 },
        { day: "Wed", baseline: 0, actual: 0, savings: 0, requests: 0 },
        { day: "Thu", baseline: 0, actual: 0, savings: 0, requests: 0 },
        { day: "Fri", baseline: 0, actual: 0, savings: 0, requests: 0 },
        { day: "Sat", baseline: 0, actual: 0, savings: 0, requests: 0 },
        { day: "Today", baseline: 0, actual: 0, savings: 0, requests: 0 }
      ];
    }

    const step = currentSpend / 6;
    const baseStep = baselineSpend / 6;
    const baseReqs = Math.max(14, activeLogs.length * 16);

    return [
      { day: "Mon", baseline: parseFloat((baseStep * 1.0).toFixed(2)), actual: parseFloat((step * 1.0).toFixed(2)), savings: parseFloat(((baseStep - step) * 1.0).toFixed(2)), requests: Math.round(baseReqs * 0.4) },
      { day: "Tue", baseline: parseFloat((baseStep * 2.1).toFixed(2)), actual: parseFloat((step * 2.0).toFixed(2)), savings: parseFloat(((baseStep - step) * 2.1).toFixed(2)), requests: Math.round(baseReqs * 0.6) },
      { day: "Wed", baseline: parseFloat((baseStep * 3.2).toFixed(2)), actual: parseFloat((step * 3.1).toFixed(2)), savings: parseFloat(((baseStep - step) * 3.2).toFixed(2)), requests: Math.round(baseReqs * 0.8) },
      { day: "Thu", baseline: parseFloat((baseStep * 4.3).toFixed(2)), actual: parseFloat((step * 4.1).toFixed(2)), savings: parseFloat(((baseStep - step) * 4.3).toFixed(2)), requests: Math.round(baseReqs * 1.1) },
      { day: "Fri", baseline: parseFloat((baseStep * 5.2).toFixed(2)), actual: parseFloat((step * 5.0).toFixed(2)), savings: parseFloat(((baseStep - step) * 5.2).toFixed(2)), requests: Math.round(baseReqs * 1.3) },
      { day: "Sat", baseline: parseFloat((baseStep * 5.8).toFixed(2)), actual: parseFloat((step * 5.6).toFixed(2)), savings: parseFloat(((baseStep - step) * 5.8).toFixed(2)), requests: Math.round(baseReqs * 1.5) },
      { day: "Today", baseline: parseFloat(baselineSpend.toFixed(2)), actual: parseFloat(currentSpend.toFixed(2)), savings: parseFloat(savedAmount.toFixed(2)), requests: Math.round(baseReqs * 1.8) }
    ];
  }, [currentSpend, baselineSpend, savedAmount, isFreshAccount, activeLogs.length]);

  // Model traffic allocation with Apple vibrant accent dots
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

  const handleCopyCurl = (logId: string, preview: string) => {
    const snippet = `curl -X POST https://gateway.outcomerouter.ai/v1/chat/completions \\\n  -H "Authorization: Bearer oir_live_8f9a2b..." \\\n  -H "X-Outcome-Strategy: outcome_optimized" \\\n  -d '{"messages": [{"role": "user", "content": "${preview}"}]}'`;
    navigator.clipboard.writeText(snippet);
    setCopiedCurlId(logId);
    setTimeout(() => setCopiedCurlId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = "Timestamp,RequestID,Model,Provider,TokensIn,TokensOut,CostUSD,CostINR,LatencyMs,Outcome,Prompt\n";
    const rows = activeLogs.map(l =>
      `"${l.created_at}","${l.id}","${l.model_used}","${l.provider}",${l.tokens_in},${l.tokens_out},${l.cost_usd},${(l.cost_usd * 86.5).toFixed(4)},${l.latency_ms},${l.outcome_success ? "Win" : "Loss"},"${(l.prompt_preview || "").replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apple_pro_v4_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleApplyAdvisor = () => {
    addRule({
      id: `rule_apple_v4_${Date.now()}`,
      name: "Apple Pro Autonomous Routing Policy",
      task_type: "customer_support",
      condition_pattern: "task == 'customer_support'",
      target_metric: "ticket_resolved",
      is_active: true,
      enabled: true,
      priority_models: ["Groq Llama 3.3 70B", "DeepSeek-V3", "Claude 3.5 Sonnet"],
      models_priority: ["Groq Llama 3.3 70B", "DeepSeek-V3", "Claude 3.5 Sonnet"],
      fallback_model: "GPT-4o",
      max_latency_ms: 250,
      max_cost_usd: 0.0005,
      min_win_rate: 0.94,
      strategy: "outcome_optimized",
      ai_synthesized: true
    });
    setAdvisorApplied(true);
    setTimeout(() => setAdvisorApplied(false), 4000);
  };

  const totalRecoveredEscrow = slaEscrowContracts.reduce((acc, c) => acc + (c.refundUsd || 0), 0);
  const budgetCap = autopilot.monthly_budget_usd * rate;
  const burnPercent = Math.min(100, (currentSpend / Math.max(1, budgetCap)) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]">
      {/* 1. Dynamic Island / Spatial Command Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]">
        {/* Apple Pro Subtle Multi-Layer Spatial Gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-pulse"></span>
                <span className="text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Apple Pro Spatial Engine · V4
                </span>
              </div>
              <span className="text-xs text-[#86868B] font-mono">37ms TTFT Global SLA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Outcome-Indexed AI Spend Router
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Autonomous multi-model intelligence gateway dynamically prioritizing marginal outcome conversion over raw model scale.
            </p>
          </div>

          {/* Apple Pro Capsule Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRefresh}
              className="h-10 w-10 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xs"
              title="Refresh telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#0050FF]" : ""}`} />
            </button>

            {isFreshAccount ? (
              <button
                onClick={loadDemoData}
                className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#0050FF] hover:text-white dark:hover:bg-[#0050FF] hover:border-transparent transition-all flex items-center gap-2 shadow-xs"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Load Sample Telemetry</span>
              </button>
            ) : (
              <button
                onClick={clearUserData}
                className="h-10 px-4 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-[#86868B] hover:text-red-500 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Clean Slate</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Export CSV</span>
            </button>

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

      {/* 2. Apple Vision Spatial Bento Grid — 4 Core Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pillar 1: Titanium Apple Card FinOps Spend */}
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] relative overflow-hidden flex flex-col justify-between group">
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

        {/* Pillar 2: Concentric Activity Rings (Outcome Quality) */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Thompson Win Rate</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] px-2.5 py-0.5 rounded-full">
              <Globe className="h-3 w-3" />
              <span>ε=0.5 DP</span>
            </span>
          </div>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              94.6%
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

        {/* Pillar 3: Micro-SLA Cryptographic Vault */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between">
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
              <span>Contracts: {slaEscrowContracts.length || 14}</span>
              <span>Breach: 0.02%</span>
            </div>
          </div>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[98%]" />
          </div>
        </div>

        {/* Pillar 4: Semantic Delta Token Reduction */}
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Semantic Delta</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full">
              <Layers className="h-3 w-3" />
              <span>60.3% Cut</span>
            </span>
          </div>

          <div className="my-5">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatNumber(deltaStats.totalTokensAvoided || 512400)}
            </div>
            <div className="text-xs text-[#86868B] mt-1 flex items-center justify-between">
              <span>&lt;delta_ref&gt; cached</span>
              <span>TTFT: 68.4ms</span>
            </div>
          </div>

          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[60%]" />
          </div>
        </div>
      </div>

      {/* 3. Apple Intelligence Proactive FinOps Advisor (Siri Iridescent Rim) */}
      <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-2xl bg-[#0050FF] text-white flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(0,80,255,0.35)] mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                Autonomous FinOps Recommendation #2026-F4
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                +14.8% Margin Recovery
              </span>
            </div>
            <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed max-w-3xl">
              Customer Support FAQ prompt traffic is routed through GPT-4o fallback. Shifting to <strong>Groq Llama 3.3 70B (84ms)</strong> will save an estimated <strong>$240.00/mo</strong> with 96.0% first-contact resolution guarantee.
            </p>
          </div>
        </div>

        <button
          onClick={handleApplyAdvisor}
          disabled={advisorApplied}
          className="h-10 px-5 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 shrink-0 self-start md:self-auto disabled:bg-emerald-600"
        >
          {advisorApplied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Rule Deployed to Gateway!</span>
            </>
          ) : (
            <>
              <span>Apply Recommended Rule</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* 4. Spatial Trajectory & Spend Velocity Center */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Spend Velocity & Avoided Trajectory
            </h2>
            <p className="text-xs text-[#86868B]">
              Real-time telemetry comparing raw brute-force model usage against outcome-indexed gateway execution
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
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

        {/* Auto-Pilot Budget Burn Velocity Bar */}
        <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Sliders className="h-4 w-4 text-[#0050FF]" />
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                Monthly Budget Ceiling: {formatCurrency(currentSpend, activeCurrency)} of {formatCurrency(budgetCap, activeCurrency)}
              </span>
              <span className="text-[#86868B] font-mono">({burnPercent.toFixed(1)}% burned)</span>
            </div>

            {/* Strategy Capsule */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#86868B]">Auto-Pilot Mode:</span>
              <div className="inline-flex p-0.5 rounded-full bg-[#E5E5EA]/70 dark:bg-[#252528]/70">
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

          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                burnPercent > 85 ? "bg-amber-500" : "bg-[#0050FF]"
              }`}
              style={{ width: `${burnPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. Model Symphony Allocation Stage (Apple Pro Glass Tiles) */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelShareData.map((m, idx) => (
            <div
              key={idx}
              className="rounded-[26px] bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/60 border border-black/[0.04] dark:border-white/[0.06] p-5 space-y-3 hover:scale-[1.02] transition-all group"
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

      {/* 6. Live Spatial Gateway Decision Stream */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-[#0050FF]" />
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Live Gateway Decision Stream
            </h3>
          </div>
          <Link
            href="/app/logs"
            className="text-xs text-[#0050FF] dark:text-[#3374FF] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View Full Audit Log</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Request & Prompt</th>
                <th className="py-3.5 px-4 font-semibold">Model Selected</th>
                <th className="py-3.5 px-4 font-semibold">Task KPI</th>
                <th className="py-3.5 px-4 font-semibold text-right">Cost</th>
                <th className="py-3.5 px-4 font-semibold text-center">Latency</th>
                <th className="py-3.5 px-4 font-semibold text-center">Outcome</th>
                <th className="py-3.5 px-5 font-semibold text-right">cURL Replay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {activeLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5 max-w-[240px]">
                    <span className="font-mono text-[11px] font-bold text-[#0050FF] dark:text-[#3374FF] block truncate">
                      {log.id}
                    </span>
                    <span className="text-[11px] text-[#86868B] truncate block mt-0.5">
                      {log.prompt_preview}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] block truncate">
                      {log.model_used}
                    </span>
                    <span className="text-[10px] text-[#86868B] uppercase font-mono">{log.provider}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                    {log.outcome_metric || "task_completed"}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {formatCurrency(log.cost_usd * rate, activeCurrency)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-[#515154] dark:text-[#A1A1A6]">
                    {log.latency_ms}ms
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => recordOutcome(log.id, true)}
                        className={`p-1.5 rounded-full transition-all ${
                          log.outcome_success === true
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold scale-110"
                            : "text-[#86868B] hover:text-[#0050FF]"
                        }`}
                        title="Mark Win"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => recordOutcome(log.id, false)}
                        className={`p-1.5 rounded-full transition-all ${
                          log.outcome_success === false
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold scale-110"
                            : "text-[#86868B] hover:text-red-600"
                        }`}
                        title="Mark Loss"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleCopyCurl(log.id, log.prompt_preview)}
                      className="px-3 py-1 rounded-full bg-white dark:bg-[#242428] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] text-[11px] font-semibold transition-all inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      {copiedCurlId === log.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Code2 className="h-3 w-3" />
                          <span>Copy cURL</span>
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

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}
    </div>
  );
}
