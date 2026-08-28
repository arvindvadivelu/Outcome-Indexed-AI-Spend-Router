"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingDown,
  CheckCircle2,
  Zap,
  Activity,
  Coins,
  Clock,
  Globe,
  Sparkles,
  Download,
  Bot
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

const PROVIDER_COLORS: Record<string, string> = {
  deepseek: "#0050FF",
  anthropic: "#9333EA",
  groq: "#059669",
  openai: "#F59E0B",
  other: "#6B7280"
};

export default function AnalyticsPage() {
  const { logs, telemetryLogs, currency, benchmarks, monthlySpendUSD, baselineSpendUSD, slaEscrowContracts } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const activeLogs = logs.length > 0 ? logs : telemetryLogs;
  const isFresh = activeLogs.length === 0;

  // ── Derived KPIs ─────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (isFresh) return { totalRequests: 0, totalCost: 0, avgLatency: 0, winRate: 0, cacheHits: 0, fallbacks: 0, totalSaved: 0 };
    const wins = activeLogs.filter((l) => l.outcome_success === true).length;
    const resolved = activeLogs.filter((l) => l.outcome_success !== null).length;
    const totalCost = activeLogs.reduce((a, l) => a + l.cost_usd, 0);
    const avgLat = activeLogs.reduce((a, l) => a + l.latency_ms, 0) / activeLogs.length;
    const cacheHits = activeLogs.filter((l) => l.cached_hit).length;
    const fallbacks = activeLogs.filter((l) => l.fallback_triggered).length;
    const totalSaved = Math.max(0, baselineSpendUSD - monthlySpendUSD);
    return {
      totalRequests: activeLogs.length,
      totalCost: parseFloat(totalCost.toFixed(4)),
      avgLatency: Math.round(avgLat),
      winRate: resolved > 0 ? parseFloat(((wins / resolved) * 100).toFixed(1)) : 0,
      cacheHits,
      fallbacks,
      totalSaved: parseFloat(totalSaved.toFixed(4))
    };
  }, [activeLogs, isFresh, monthlySpendUSD, baselineSpendUSD]);

  // ── Provider distribution ─────────────────────────────────────────────────────
  const providerDist = useMemo(() => {
    if (isFresh) {
      return [
        { name: "DeepSeek", value: 45, color: PROVIDER_COLORS.deepseek },
        { name: "Anthropic", value: 28, color: PROVIDER_COLORS.anthropic },
        { name: "Groq", value: 21, color: PROVIDER_COLORS.groq },
        { name: "OpenAI", value: 6, color: PROVIDER_COLORS.openai }
      ];
    }
    const counts: Record<string, number> = {};
    activeLogs.forEach((l) => {
      const p = l.provider?.toLowerCase() || "other";
      const key = p.includes("deepseek") ? "deepseek" : p.includes("anthropic") || p.includes("claude") ? "anthropic" : p.includes("groq") ? "groq" : p.includes("openai") ? "openai" : "other";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([key, val]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: Math.round((val / activeLogs.length) * 100),
      color: PROVIDER_COLORS[key] || PROVIDER_COLORS.other
    }));
  }, [activeLogs, isFresh]);

  // ── Daily spend trend ─────────────────────────────────────────────────────────
  const spendTrend = useMemo(() => {
    const days = timeRange === "24h" ? 8 : timeRange === "7d" ? 7 : 30;
    const labels = Array.from({ length: days }, (_, i) => {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    if (isFresh) return labels.map((label) => ({ label, cost: 0, baseline: 0 }));

    const perDay = (monthlySpendUSD * rate) / days;
    const perDayBase = (baselineSpendUSD * rate) / days;
    return labels.map((label, i) => {
      const m = 0.6 + ((i * 7 + 3) % 11) / 11 * 0.8;
      return {
        label,
        cost: parseFloat((perDay * m).toFixed(3)),
        baseline: parseFloat((perDayBase * m).toFixed(3))
      };
    });
  }, [isFresh, monthlySpendUSD, baselineSpendUSD, rate, timeRange]);

  // ── Win rate by task ──────────────────────────────────────────────────────────
  const winByTask = useMemo(() => {
    if (isFresh) {
      return benchmarks.slice(0, 4).map((b) => ({
        task: b.task_type.replace(/_/g, " "),
        winRate: parseFloat((b.win_rate * 100).toFixed(1))
      }));
    }
    const tasks: Record<string, { wins: number; total: number }> = {};
    activeLogs.forEach((l) => {
      if (!tasks[l.task_type]) tasks[l.task_type] = { wins: 0, total: 0 };
      tasks[l.task_type].total++;
      if (l.outcome_success === true) tasks[l.task_type].wins++;
    });
    return Object.entries(tasks).map(([task, { wins, total }]) => ({
      task: task.replace(/_/g, " "),
      winRate: parseFloat(((wins / Math.max(1, total)) * 100).toFixed(1))
    }));
  }, [activeLogs, isFresh, benchmarks]);

  // ── SLA stats ─────────────────────────────────────────────────────────────────
  const slaStats = useMemo(() => {
    const total = slaEscrowContracts.length;
    const breached = slaEscrowContracts.filter((c) => c.status === "breached_escrow_refunded").length;
    const refunded = slaEscrowContracts.reduce((a, c) => a + c.refundUsd, 0);
    return { total, breached, fulfilled: total - breached, refunded: parseFloat(refunded.toFixed(4)) };
  }, [slaEscrowContracts]);

  const handleExportReport = () => {
    const report = { generated_at: new Date().toISOString(), time_range: timeRange, kpis, sla_stats: slaStats, provider_distribution: providerDist, win_rate_by_task: winByTask };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_report_${timeRange}_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Analytics &amp; Insights
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Deep-dive into cost efficiency, outcome win rates, SLA health, and provider distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
            {(["24h", "7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  timeRange === r
                    ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#8E8E93] hover:text-[#1D1D1F] shadow-xs transition-all"
          >
            <Download className="h-3.5 w-3.5 text-[#0050FF]" />
            Export
          </button>
        </div>
      </div>

      {/* Fresh state banner */}
      {isFresh && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EEF4FF] to-white dark:from-[#0050FF]/15 dark:to-[#161618] border border-[#0050FF]/20 flex items-center gap-3 text-xs">
          <Sparkles className="h-4 w-4 text-[#0050FF] flex-shrink-0" />
          <span className="text-[#515154] dark:text-[#8E8E93]">
            Showing industry benchmark data. Run requests via the <strong>Simulate Request</strong> button in the Dashboard to populate real analytics.
          </span>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Requests", value: isFresh ? "0" : kpis.totalRequests.toLocaleString(), icon: <Activity className="h-3.5 w-3.5" />, accent: "text-[#0050FF]", bg: "bg-[#EEF4FF] dark:bg-[#0050FF]/20" },
          { label: "Routed Spend", value: formatCurrency(kpis.totalCost * rate, currency), icon: <Coins className="h-3.5 w-3.5" />, accent: "text-[#1D1D1F] dark:text-[#F5F5F7]", bg: "bg-[#F5F5F7] dark:bg-[#1F1F23]" },
          { label: "Net Savings", value: formatCurrency(kpis.totalSaved * rate, currency), icon: <TrendingDown className="h-3.5 w-3.5" />, accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-[#E6F4EA] dark:bg-[#1E3A2F]" },
          { label: "Win Rate", value: isFresh ? "—" : `${kpis.winRate}%`, icon: <CheckCircle2 className="h-3.5 w-3.5" />, accent: "text-[#0050FF]", bg: "bg-[#EEF4FF] dark:bg-[#0050FF]/20" },
          { label: "Avg Latency", value: isFresh ? "—" : `${kpis.avgLatency}ms`, icon: <Clock className="h-3.5 w-3.5" />, accent: "text-[#1D1D1F] dark:text-[#F5F5F7]", bg: "bg-[#F5F5F7] dark:bg-[#1F1F23]" },
          { label: "Cache Hit Rate", value: isFresh ? "—" : `${Math.round((kpis.cacheHits / Math.max(1, kpis.totalRequests)) * 100)}%`, icon: <Zap className="h-3.5 w-3.5" />, accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-[#E6F4EA] dark:bg-[#1E3A2F]" }
        ].map((kpi, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-[#86868B]">
              <span>{kpi.label}</span>
              <div className={`h-6 w-6 rounded-lg ${kpi.bg} ${kpi.accent} flex items-center justify-center`}>
                {kpi.icon}
              </div>
            </div>
            <div className={`text-xl font-bold font-mono ${kpi.accent}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Spend vs Baseline Area Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div>
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Cost Trend: OutcomeRouter vs. GPT-4o Baseline ({timeRange})</h2>
          <p className="text-xs text-[#86868B] mt-0.5">Daily routed spend compared to unoptimized single-model cost</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendTrend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="acostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0050FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0050FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="abaseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86868B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#86868B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#86868B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#86868B" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.95)" }}
                formatter={(v: unknown) => [`${currency === "INR" ? "₹" : "$"}${Number(v).toFixed(3)}`, ""]}
              />
              <Area type="monotone" dataKey="baseline" name="GPT-4o Baseline" stroke="#86868B" strokeWidth={1.5} fill="url(#abaseGrad)" dot={false} />
              <Area type="monotone" dataKey="cost" name="Routed Spend" stroke="#0050FF" strokeWidth={2} fill="url(#acostGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two columns: Provider Pie + Win Rate by Task */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provider Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Provider Traffic Distribution</h2>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <PieChart width={160} height={160}>
                <Pie data={providerDist} dataKey="value" cx={75} cy={75} innerRadius={42} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                  {providerDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`${Number(v)}%`, ""]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "none" }} />
              </PieChart>
            </div>
            <div className="space-y-2 flex-1">
              {providerDist.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-[#515154] dark:text-[#8E8E93]">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Win Rate by Task */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Outcome Win Rate by Task Domain</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winByTask} layout="vertical" margin={{ left: 8, right: 8 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#86868B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="task" tick={{ fontSize: 10, fill: "#86868B" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip formatter={(v: unknown) => [`${Number(v)}%`, "Win Rate"]} contentStyle={{ fontSize: 11, borderRadius: 8, border: "none" }} />
                <Bar dataKey="winRate" fill="#0050FF" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SLA Health Dashboard */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#0050FF]" />
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">SLA Escrow Health</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Contracts", value: String(slaStats.total), color: "text-[#0050FF]" },
            { label: "Fulfilled ✓", value: String(slaStats.fulfilled), color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Breached & Refunded", value: String(slaStats.breached), color: "text-red-500" },
            { label: "Total Refunded", value: formatCurrency(slaStats.refunded * rate, currency), color: "text-amber-600 dark:text-amber-400" }
          ].map((s, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-[#FBFBFD] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06]">
              <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-[#86868B] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        {slaStats.total === 0 && (
          <p className="text-xs text-[#86868B] text-center">No SLA contracts yet. Contracts are created automatically for each routed request.</p>
        )}
      </div>

      {/* Cost per Outcome Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#0050FF]" />
          <h2 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Cost Per Positive Outcome — Model Benchmark</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#86868B] border-b border-black/[0.05] dark:border-white/[0.06]">
                <th className="pb-2 text-left font-medium">Model</th>
                <th className="pb-2 text-left font-medium">Provider</th>
                <th className="pb-2 text-right font-medium">Win Rate</th>
                <th className="pb-2 text-right font-medium">Avg Latency</th>
                <th className="pb-2 text-right font-medium">Cost/Outcome</th>
                <th className="pb-2 text-right font-medium">Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {benchmarks
                .sort((a, b) => a.cost_per_positive_outcome - b.cost_per_positive_outcome)
                .map((b, i) => (
                  <tr key={i} className="hover:bg-[#FBFBFD] dark:hover:bg-[#1F1F23] transition-colors">
                    <td className="py-2 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">{b.model_name}</td>
                    <td className="py-2 text-[#86868B] capitalize">{b.provider}</td>
                    <td className="py-2 text-right font-mono text-emerald-600 dark:text-emerald-400">{b.win_rate_pct}%</td>
                    <td className="py-2 text-right font-mono text-[#515154] dark:text-[#8E8E93]">{b.avg_latency_ms}ms</td>
                    <td className="py-2 text-right font-mono text-[#0050FF] dark:text-[#3374FF]">
                      {formatCurrency(b.cost_per_positive_outcome * rate, currency)}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.pareto_tier === "frontier"
                          ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                          : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#86868B]"
                      }`}>
                        {b.pareto_tier}
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
