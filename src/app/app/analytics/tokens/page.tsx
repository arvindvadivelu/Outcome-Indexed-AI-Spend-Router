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
  CheckCircle2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function TokenAnalyticsPage() {
  const { currentTokens, monthlyQuota, currency } = useAppStore();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Token Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Monitor prompt compression, token consumption, and cache hit rates
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
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>AI Token Optimization Diagnostic</span>
            </div>
            <span className="text-[11px] font-semibold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full">
              Fix Ready
            </span>
          </div>
          <p className="text-xs text-[#515154] leading-relaxed">{auditResult.recommendation}</p>
          <div className="p-2.5 rounded-xl bg-[#F5F5F7] text-xs text-[#0050FF] font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Recommended: {auditResult.optimalCacheRule}</span>
          </div>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-1.5">
          <span className="text-xs text-[#86868B] font-medium">Total Tokens Used</span>
          <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
            {formatNumber(currentTokens)}
          </div>
          <p className="text-xs text-[#86868B]">Quota: {formatNumber(monthlyQuota)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-1.5">
          <span className="text-xs text-[#86868B] font-medium">Semantic Cache Hit Rate</span>
          <div className="text-2xl font-bold text-[#0050FF] font-mono">
            34.8%
          </div>
          <p className="text-xs text-emerald-600 font-medium">Served instantly at $0 token cost</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-1.5">
          <span className="text-xs text-[#86868B] font-medium">De-Fluffing Compression</span>
          <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
            -28.4%
          </div>
          <p className="text-xs text-[#86868B]">Boilerplate stripped before inference</p>
        </div>
      </div>

      {/* Token Volume Chart */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-sm">Daily Token Breakdown</h3>
            <p className="text-xs text-[#86868B]">Input Tokens, Output Tokens, and Cached Tokens</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#515154]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0050FF]"></span> Input
            </span>
            <span className="flex items-center gap-1.5 text-[#515154]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#80A8FF]"></span> Output
            </span>
            <span className="flex items-center gap-1.5 text-[#515154]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5EA]"></span> Cached
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTokenData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F2" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="input" fill="#0050FF" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="output" fill="#80A8FF" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="cached" fill="#E5E5EA" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
