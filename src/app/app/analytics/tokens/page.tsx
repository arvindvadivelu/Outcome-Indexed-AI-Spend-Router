"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Layers,
  Database,
  TrendingDown,
  Sparkles,
  Bot,
  CheckCircle2,
  Cpu,
  FileCode,
  ArrowRight
} from "lucide-react";
import dynamic from "next/dynamic";

const TokenBarChart = dynamic(
  () => import("@/components/TokenBarChart").then((mod) => mod.TokenBarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center bg-[#FBFBFD] dark:bg-[#161618] rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] animate-pulse">
        Loading token analytics...
      </div>
    ),
  }
);

export default function TokenAnalyticsPage() {
  const { currentTokens, monthlyQuota, currency, deltaStats } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  // AI Token Anomaly Analyzer state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleRunAiAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setAuditResult({
        totalWastedTokens: 184200,
        estimatedDollarLossUSD: 94.20,
        recommendation: "Detected 4,200 repetitive system prompt headers in Customer Support. Enabling prompt de-fluffing will eliminate 32% of input tokens, immediately saving $94.20/month.",
        optimalCacheRule: "Enable pgvector cosine threshold 0.92 for 'customer_support' task domain."
      });
      setIsAuditing(false);
    }, 450);
  };

  const dailyTokenData = [
    { day: "Aug 20", input: 42000, output: 28000, cached: 18000 },
    { day: "Aug 21", input: 48000, output: 32000, cached: 21000 },
    { day: "Aug 22", input: 39000, output: 26000, cached: 19000 },
    { day: "Aug 23", input: 54000, output: 38000, cached: 28000 },
    { day: "Aug 24", input: 61000, output: 41000, cached: 32000 },
    { day: "Aug 25", input: 58000, output: 39000, cached: 30000 },
    { day: "Aug 26", input: 65000, output: 44000, cached: 35000 }
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Token Analytics & Semantic Delta
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Monitor prompt compression, token diffing, and cache hit rates
          </p>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAuditing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/20"
        >
          <Bot className="h-3.5 w-3.5" />
          <span>{isAuditing ? "Auditing..." : "Audit Token Waste"}</span>
        </button>
      </div>

      {/* AI Token Waste Diagnostic Panel */}
      {auditResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              <Sparkles className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <span>AI Token Optimization Diagnostic</span>
            </div>
            <span className="text-[11px] font-semibold text-[#0050FF] dark:text-[#3374FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 px-2.5 py-0.5 rounded-full">
              Fix Ready
            </span>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{auditResult.recommendation}</p>
          <div className="p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-xs text-[#0050FF] dark:text-[#3374FF] font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Recommended: {auditResult.optimalCacheRule}</span>
          </div>
        </div>
      )}

      {/* Feature 3: Differential Semantic Delta Compression Inspector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                Differential Semantic Delta Compression
              </h3>
              <p className="text-xs text-[#86868B]">
                Replaces repetitive multi-turn prompt nodes with cryptographic pointers
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-[#E6F4EA] dark:bg-[#1E3A2F] px-3 py-1 rounded-full self-start sm:self-auto">
            -{deltaStats.compressionRatioPct}% Tokens Avoided
          </span>
        </div>

        {/* Diff Visualizer Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-[#FBFBFD] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase">Raw Full Context (1,240 tokens)</span>
            <div className="font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6] bg-white dark:bg-[#161618] p-3 rounded-lg border border-black/[0.04] dark:border-white/[0.06] overflow-x-auto leading-relaxed">
              <span className="text-red-500 line-through">You are an expert full-stack TypeScript engineer specializing in Next.js 14, React 18, Tailwind CSS... [420 words repeated]</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FBFBFD] dark:bg-[#1F1F23] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
            <span className="text-[11px] font-semibold text-[#0050FF] dark:text-[#3374FF] uppercase">Semantic Delta Ref (480 tokens)</span>
            <div className="font-mono text-[11px] text-[#0050FF] dark:text-[#3374FF] bg-white dark:bg-[#161618] p-3 rounded-lg border border-black/[0.04] dark:border-white/[0.06] overflow-x-auto leading-relaxed">
              <span>&lt;delta_ref:node_sys_react_expert:8f9a2b&gt;</span><br />
              <span>User prompt delta: Refactor API route with streaming...</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Total Avoided Tokens</span>
          <div className="text-2xl font-bold text-[#0050FF] dark:text-[#3374FF] font-mono">
            +{formatNumber(deltaStats.totalTokensAvoided)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">via Semantic Delta Diffing</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Direct Dollar Savings</span>
          <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
            +{currency === "INR" ? `₹${(deltaStats.costSavedUsd * rate).toFixed(2)}` : `$${deltaStats.costSavedUsd.toFixed(2)}`}
          </div>
          <p className="text-xs text-[#86868B]">Avoided gateway transmission costs</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Global Cache Hit Ratio</span>
          <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
            34.2%
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Cosine threshold &gt;0.92</p>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-sm">
              Daily Token Flow & Cache Savings
            </h3>
            <p className="text-xs text-[#86868B]">
              Input tokens (blue), Output tokens (light blue), and Cache saved (gray)
            </p>
          </div>
        </div>

        <TokenBarChart data={dailyTokenData} />
      </div>
    </div>
  );
}
