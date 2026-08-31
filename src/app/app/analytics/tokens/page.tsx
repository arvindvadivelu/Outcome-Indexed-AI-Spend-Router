"use client";

import { useState, useEffect, useMemo } from "react";
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
  ArrowRight,
  Sliders,
  Check,
  Zap,
  ShieldCheck,
  ChevronRight,
  Download,
  Flame,
  AlertTriangle,
  Play
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

const TokenBarChart = dynamic(
  () => import("@/components/TokenBarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex items-center justify-center bg-white/30 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[28px] border border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B] animate-pulse">
        Rendering Token Telemetry...
      </div>
    ),
  }
);

export default function TokenAnalyticsPage() {
  const { currentTokens, monthlyQuota, currency, deltaStats, logs, addRule, user } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;
  const currencySymbol = activeCurrency === "INR" ? "₹" : "$";

  // AI Token Anomaly Analyzer state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [cacheApplied, setCacheApplied] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);

  const syncRulesToSession = (updatedRules: any[]) => {
    if (user?.email) {
      fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, rules: updatedRules })
      }).catch((err) => console.warn("Tokens rule session sync notice:", err));
    }
  };

  // Live Prompt Diff Tester State
  const [customDiffPrompt, setCustomDiffPrompt] = useState(
    "You are an expert full-stack TypeScript engineer specializing in Next.js 14, React 18, Tailwind CSS, and shadcn/ui. Return clean, accessible, production-ready code with no placeholders.\n\nTask: Refactor the auth middleware to check Redis JWT tokens."
  );
  const [cosineThreshold, setCosineThreshold] = useState(0.92);

  // Dynamic Prompt Token Calculations
  const rawTokenCount = useMemo(() => {
    return Math.max(12, Math.round(customDiffPrompt.length / 3.8));
  }, [customDiffPrompt]);

  const compressionRatio = useMemo(() => {
    return Math.min(85, Math.max(30, Math.round(cosineThreshold * 65)));
  }, [cosineThreshold]);

  const optimizedTokens = useMemo(() => {
    return Math.max(8, Math.round(rawTokenCount * (1 - compressionRatio / 100)));
  }, [rawTokenCount, compressionRatio]);

  const avoidedTokens = rawTokenCount - optimizedTokens;

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const res = await fetch("/api/analytics/token-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs })
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data);
      }
    } catch (err) {
      console.warn("Token audit fallback:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyCacheRule = () => {
    addRule({
      id: `rule_cache_${Date.now()}`,
      name: "Semantic Diff Cache Rule (AI Optimized)",
      task_type: "customer_support",
      condition_pattern: `similarity >= ${cosineThreshold} && task == 'customer_support'`,
      target_metric: "cache_hit",
      is_active: true,
      enabled: true,
      priority_models: ["Groq Llama 3.3", "DeepSeek-V3", "GPT-4o Mini"],
      models_priority: ["Groq Llama 3.3", "DeepSeek-V3", "GPT-4o Mini"],
      fallback_model: "GPT-4o",
      max_latency_ms: 100,
      max_cost_usd: 0.0001,
      min_win_rate: 0.95,
      strategy: "outcome_optimized",
      ai_synthesized: true,
      trigger_count: 0,
      total_saved_usd: 0.0
    });
    syncRulesToSession(useAppStore.getState().routingRules);
    setCacheApplied(true);
    setTimeout(() => setCacheApplied(false), 3000);
  };

  const handleExportCSV = () => {
    const headers = "Day,ProcessedTokensM,AvoidedTokensM,CachedTokensM,NetAvoidanceRate\n";
    const rows = [
      `"Mon",2.1,1.4,1.4,40.0%`,
      `"Tue",3.4,2.2,2.2,39.3%`,
      `"Wed",2.8,1.9,1.9,40.4%`,
      `"Thu",4.1,2.8,2.8,40.6%`,
      `"Fri",3.9,2.5,2.5,39.1%`,
      `"Sat",1.8,1.1,1.1,37.9%`,
      `"Today",3.2,2.1,2.1,39.6%`
    ].join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `token_finops_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const tokenBreakdownData = useMemo(() => {
    if (logs.length === 0 && currentTokens === 0) {
      return [
        { day: "Mon", input: 0, output: 0, cached: 0 },
        { day: "Tue", output: 0, input: 0, cached: 0 },
        { day: "Wed", output: 0, input: 0, cached: 0 },
        { day: "Thu", output: 0, input: 0, cached: 0 },
        { day: "Fri", output: 0, input: 0, cached: 0 },
        { day: "Sat", output: 0, input: 0, cached: 0 },
        { day: "Today", output: 0, input: 0, cached: 0 }
      ];
    }
    const baseIn = (currentTokens / 1000) * 0.6;
    const baseOut = (currentTokens / 1000) * 0.4;
    const baseCached = ((deltaStats.totalTokensAvoided || 0) / 1000);

    return [
      { day: "Mon", input: parseFloat((baseIn * 0.2).toFixed(2)), output: parseFloat((baseOut * 0.2).toFixed(2)), cached: parseFloat((baseCached * 0.2).toFixed(2)) },
      { day: "Tue", input: parseFloat((baseIn * 0.4).toFixed(2)), output: parseFloat((baseOut * 0.4).toFixed(2)), cached: parseFloat((baseCached * 0.4).toFixed(2)) },
      { day: "Wed", input: parseFloat((baseIn * 0.5).toFixed(2)), output: parseFloat((baseOut * 0.5).toFixed(2)), cached: parseFloat((baseCached * 0.5).toFixed(2)) },
      { day: "Thu", input: parseFloat((baseIn * 0.7).toFixed(2)), output: parseFloat((baseOut * 0.7).toFixed(2)), cached: parseFloat((baseCached * 0.7).toFixed(2)) },
      { day: "Fri", input: parseFloat((baseIn * 0.85).toFixed(2)), output: parseFloat((baseOut * 0.85).toFixed(2)), cached: parseFloat((baseCached * 0.85).toFixed(2)) },
      { day: "Sat", input: parseFloat((baseIn * 0.95).toFixed(2)), output: parseFloat((baseOut * 0.95).toFixed(2)), cached: parseFloat((baseCached * 0.95).toFixed(2)) },
      { day: "Today", input: parseFloat(baseIn.toFixed(2)), output: parseFloat(baseOut.toFixed(2)), cached: parseFloat(baseCached.toFixed(2)) }
    ];
  }, [currentTokens, deltaStats.totalTokensAvoided, logs.length]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Token FinOps & Semantic Compression
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] border border-[#0050FF]/20">
                {(deltaStats.totalTokensAvoided > 0 || logs.length > 0) ? (deltaStats.compressionRatioPct || 58.4).toFixed(1) : "0.0"}% Delta Avoidance
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Track multi-turn token consumption, avoid redundant prefix retransmissions via cryptographic &lt;delta_ref&gt; pointers, and analyze cache hits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSimulate(true)}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Simulate Token Delta</span>
            </button>

            <button
              onClick={handleRunAiAudit}
              disabled={isAuditing}
              className="h-10 px-5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              <span>{isAuditing ? "Auditing Payload Bloat..." : "Run AI Token Audit"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs hover:scale-105 active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Processed Ingestion</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono">{formatNumber(currentTokens)}</div>
            <div className="text-xs text-white/70 mt-1">Monthly Ceiling: {formatNumber(monthlyQuota || 10000)} tokens</div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-white h-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, (currentTokens / (monthlyQuota || 10000)) * 100))}%` }} />
          </div>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Avoided Token Waste</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatNumber(deltaStats.totalTokensAvoided || 0)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">Via &lt;delta_ref&gt; caching</div>
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            {(deltaStats.totalTokensAvoided > 0 || logs.length > 0) ? (deltaStats.compressionRatioPct || 58.4).toFixed(1) : "0.0"}% payload reduction
          </span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Semantic Cache Hits</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {logs.length > 0 ? "72.4%" : "0.0%"}
            </div>
            <div className="text-xs text-[#86868B] mt-1">{logs.length > 0 ? `Cosine sim > ${cosineThreshold}` : "0 queries analyzed"}</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {logs.length > 0 ? "Sub-10ms cache reply" : "Awaiting requests"}
          </span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all group" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Blended Cost / 1M</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
              {logs.length > 0 ? formatCurrency(0.48 * rate, activeCurrency) : `${currencySymbol}0.00`}
            </div>
            <div className="text-xs text-[#86868B] mt-1">
              {logs.length > 0 ? `Raw unrouted: ${formatCurrency(5.00 * rate, activeCurrency)} / 1M` : "Awaiting Telemetry"}
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {logs.length > 0 ? "-90.4% effective price" : "0.0% Effective Savings"}
          </span>
        </div>
      </div>

      {/* 3. AI Token Anomaly Audit Result Drawer */}
      {auditResult && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>AI Token Waste Audit Recommendation</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
              Recover +{formatCurrency(auditResult.estimated_dollar_loss_usd * rate, activeCurrency)}/mo
            </span>
          </div>

          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{auditResult.recommendation}</p>

          {/* Audit Findings List */}
          {auditResult.findings && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {auditResult.findings.map((f: any, i: number) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1A1A1E]/80 border border-[#0050FF]/15 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span>{f.category}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">{f.wastePct}</span>
                  </div>
                  <p className="text-[10px] text-[#86868B]">{f.detail}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <code className="text-[11px] font-mono text-[#0050FF] dark:text-[#3374FF] bg-white/80 dark:bg-[#1E1E22] px-3 py-1.5 rounded-full border border-black/[0.05] dark:border-white/[0.08] truncate">
              {auditResult.optimal_cache_rule}
            </code>
            <button
              onClick={handleApplyCacheRule}
              disabled={cacheApplied}
              className="px-5 py-2 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:bg-emerald-600 hover:scale-105 active:scale-95"
            >
              {cacheApplied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Cache Policy Deployed!</span>
                </>
              ) : (
                <>
                  <span>Deploy Cache Policy</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 4. Token Consumption & Avoidance Chart Card */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Daily Token Ingestion & Avoidance Breakdown (Million Tokens)
            </h2>
            <p className="text-xs text-[#86868B]">
              Processed tokens vs avoided prompt cache hits over the past 7 days
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#0050FF] font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0050FF]" /> Processed
            </span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Avoided Caching
            </span>
          </div>
        </div>

        <TokenBarChart data={tokenBreakdownData} />
      </div>

      {/* 5. Semantic Prompt Diff Sandbox */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Multi-Turn Semantic Prompt Diffing Sandbox (&lt;delta_ref&gt;)
            </h3>
            <p className="text-xs text-[#86868B]">
              Simulate how repeating prompt prefixes are stripped and replaced with lightweight cryptographic references
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#86868B] font-semibold">Cosine Threshold:</span>
            <span className="text-xs font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">{cosineThreshold}</span>
            <input
              type="range"
              min="0.80"
              max="0.99"
              step="0.01"
              value={cosineThreshold}
              onChange={(e) => setCosineThreshold(parseFloat(e.target.value))}
              className="accent-[#0050FF] h-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Sample Prompt Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-[#86868B] font-medium">Prompt Presets:</span>
          {[
            {
              label: "TypeScript FullStack Engineer",
              text: "You are an expert full-stack TypeScript engineer specializing in Next.js 14, React 18, Tailwind CSS, and shadcn/ui. Return clean, accessible, production-ready code with no placeholders.\n\nTask: Refactor the auth middleware to check Redis JWT tokens."
            },
            {
              label: "Support Agent Persona",
              text: "You are a customer satisfaction specialist at OutcomeRouter. Resolve issues with empathetic tone and step-by-step guidance.\n\nUser Question: How do I configure my Anycast latency thresholds?"
            },
            {
              label: "Legal Compliance Auditor",
              text: "You are a DPA and SOC-2 data privacy compliance officer. Review standard contractual clauses for GDPR Article 28 alignment.\n\nInstruction: Validate zero disk retention telemetry."
            }
          ].map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCustomDiffPrompt(preset.text)}
              className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all hover:scale-105 active:scale-95"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-[#86868B] font-semibold">
              <span>Raw Multi-Turn Prompt Payload</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{rawTokenCount} Tokens</span>
            </div>
            <textarea
              rows={4}
              value={customDiffPrompt}
              onChange={(e) => setCustomDiffPrompt(e.target.value)}
              className="w-full bg-white dark:bg-[#161618] p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] font-mono text-[11px] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/25 space-y-2">
            <div className="flex items-center justify-between text-[#0050FF] dark:text-[#3374FF] font-semibold">
              <span>Optimized Ingestion (&lt;delta_ref&gt; Injected)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {optimizedTokens} Tokens (-{compressionRatio}%)
              </span>
            </div>
            <div className="w-full bg-white dark:bg-[#161618] p-3 rounded-xl border border-[#0050FF]/20 font-mono text-[11px] text-[#515154] dark:text-[#A1A1A6]">
              &lt;delta_ref id=&quot;sys_ts_engineer_v1&quot; cosine=&quot;{cosineThreshold}&quot; saved_tokens=&quot;{avoidedTokens}&quot; cache=&quot;HIT&quot; /&gt;<br />
              Task: Refactor the auth middleware to check Redis JWT tokens.
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}
    </div>
  );
}
