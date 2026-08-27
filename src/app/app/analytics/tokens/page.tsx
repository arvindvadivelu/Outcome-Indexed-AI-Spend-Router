"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Layers,
  Database,
  TrendingDown,
  Clock,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle
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
        recommendation: "Detected 4,200 repetitive system prompt headers across Customer Support traffic. Enabling Generative Context Compression will eliminate 32% of input tokens, immediately saving $94.20/month.",
        optimalCacheRule: "Enable pgvector cosine threshold 0.92 for 'customer_support' task domain."
      });
      setIsAuditing(false);
    }, 500);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Token Analytics & AI Waste Detector
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Track token consumption, prompt de-fluffing compression ratios, and cache hits
          </p>
        </div>

        <button
          onClick={handleRunAiAudit}
          disabled={isAuditing}
          className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          <span>{isAuditing ? "Auditing Tokens..." : "Run AI Token Waste Audit"}</span>
        </button>
      </div>

      {/* AI Token Waste Diagnostic Panel */}
      {auditResult && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>AI Token Optimization Diagnostic</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
              Actionable Fix Ready
            </span>
          </div>
          <p className="text-xs text-[#515154] leading-relaxed font-sans">{auditResult.recommendation}</p>
          <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#0050FF] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Recommended Policy: {auditResult.optimalCacheRule}</span>
          </div>
        </div>
      )}

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-2">
          <span className="text-xs font-semibold text-[#86868B]">Current Tokens Consumed</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F]">
            {formatNumber(currentTokens)}
          </div>
          <p className="text-[10px] text-[#86868B] font-mono">Quota: {formatNumber(monthlyQuota)}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-2">
          <span className="text-xs font-semibold text-[#86868B]">Tokens Saved by Cache</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF]">
            +537,000
          </div>
          <p className="text-[10px] text-[#0050FF] font-mono">34.2% Cache Hit Ratio</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-2">
          <span className="text-xs font-semibold text-[#86868B]">Context Compression</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF]">
            -31.8%
          </div>
          <p className="text-[10px] text-[#6E6E73] font-mono">Boilerplate de-fluffing</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-2">
          <span className="text-xs font-semibold text-[#86868B]">Net Dollars Saved</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF]">
            +{formatCurrency(608.30 * rate, currency)}
          </div>
          <p className="text-[10px] text-[#0050FF] font-mono">-42% vs GPT-4o Baseline</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-4">
          <div>
            <h3 className="font-bold text-base text-[#1D1D1F]">Daily Token Breakdown</h3>
            <p className="text-xs text-[#86868B]">Input, completion, and cache-saved tokens</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTokenData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
              <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
              <YAxis stroke="#86868B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E5E5EA",
                  borderRadius: "1rem",
                  fontSize: "12px",
                  color: "#1D1D1F"
                }}
              />
              <Bar dataKey="input" fill="#0050FF" name="Input Tokens" radius={[4, 4, 0, 0]} />
              <Bar dataKey="output" fill="#80A8FF" name="Output Tokens" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cached" fill="#D9E5FF" name="Saved by Cache" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
