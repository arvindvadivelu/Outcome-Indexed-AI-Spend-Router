"use client";

import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  TrendingDown,
  Sparkles,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Coins,
  Bot,
  Gauge,
  Zap,
  ShieldCheck
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const { currency, monthlySpendUSD, baselineSpendUSD, telemetryLogs, autopilot } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  const currentSpend = monthlySpendUSD * rate;
  const baselineSpend = baselineSpendUSD * rate;
  const savedAmount = baselineSpend - currentSpend;

  // Daily spend trend data
  const spendTrendData = [
    { day: "Aug 1", baseline: 62 * rate, actual: 36 * rate, savings: 26 * rate },
    { day: "Aug 5", baseline: 68 * rate, actual: 39 * rate, savings: 29 * rate },
    { day: "Aug 10", baseline: 74 * rate, actual: 41 * rate, savings: 33 * rate },
    { day: "Aug 15", baseline: 80 * rate, actual: 44 * rate, savings: 36 * rate },
    { day: "Aug 20", baseline: 92 * rate, actual: 51 * rate, savings: 41 * rate },
    { day: "Aug 25", baseline: 98 * rate, actual: 55 * rate, savings: 43 * rate },
    { day: "Aug 26", baseline: 104 * rate, actual: 58 * rate, savings: 46 * rate }
  ];

  // Model traffic distribution
  const modelShareData = [
    { name: "DeepSeek (V3/Coder)", value: 46, color: "#0050FF" },
    { name: "Claude 3.5 Sonnet", value: 28, color: "#3374FF" },
    { name: "Groq (Llama 3.3)", value: 16, color: "#80A8FF" },
    { name: "GPT-4o / mini", value: 8, color: "#B3CCFF" },
    { name: "Ollama (Local $0)", value: 2, color: "#D9E5FF" }
  ];

  // Task Outcome Win Rates
  const outcomeWinRates = [
    { task: "Sales Email (Outbound)", rate: 93.4, model: "Claude 3.5 Sonnet" },
    { task: "Code Review (TS/Python)", rate: 92.1, model: "DeepSeek Coder" },
    { task: "Customer Support FAQ", rate: 96.2, model: "Llama 3.3 (Groq)" },
    { task: "SQL & Data Extraction", rate: 94.8, model: "DeepSeek-V3" }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            AI Spend & Autonomous Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Real-time Bayesian Pareto routing, Auto-Pilot budget pacing, and Critic telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-apple-sm text-xs text-[#515154]">
            <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-pulse"></span>
            <span className="font-mono font-medium">Auto-Pilot Mode: {autopilot.mode.replace("_", " ").toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Net Savings */}
        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868B]">Net Spend Savings</span>
            <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF]">
              +{formatCurrency(savedAmount, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0050FF] font-semibold mt-1">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>-42.0% vs. GPT-4o Baseline</span>
            </div>
          </div>
        </div>

        {/* Card 2: Actual AI Spend */}
        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868B]">Month-to-Date Spend</span>
            <div className="h-8 w-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F]">
              {formatCurrency(currentSpend, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#86868B] mt-1 font-mono">
              <span className="line-through text-red-500">
                {formatCurrency(baselineSpend, currency)}
              </span>
              <span>(Saved 42%)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Win Rate */}
        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868B]">Avg Outcome Win Rate</span>
            <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F]">
              93.8%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0050FF] font-semibold mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+3.2% vs. proprietary default</span>
            </div>
          </div>
        </div>

        {/* Card 4: P95 Latency & Cache */}
        <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868B]">P95 Latency / Cache</span>
            <div className="h-8 w-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F]">
              184ms
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#0050FF] font-semibold mt-1 font-mono">
              <Database className="h-3.5 w-3.5" />
              <span>34.2% Cache Hit Ratio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous AI Telemetry Grid (4 Subsystems) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#0050FF]/20 shadow-apple-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#0050FF]" />
            <h3 className="font-bold text-sm text-[#1D1D1F]">Autonomous AI Engines Health</h3>
          </div>
          <span className="text-[10px] font-mono text-[#0050FF] font-bold">6 Subsystems Operating</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block">Auto-Pilot Burn Pace</span>
            <span className="font-bold text-[#0050FF] text-base">0.97x (Optimal)</span>
            <p className="text-[10px] text-[#6E6E73] mt-0.5">Proj: {formatCurrency(autopilot.projected_spend_usd * rate, currency)}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block">Speculative Race Wins</span>
            <span className="font-bold text-[#0050FF] text-base">71.4% Fast-Track</span>
            <p className="text-[10px] text-[#6E6E73] mt-0.5">-60% tail latency</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block">Critic Self-Corrections</span>
            <span className="font-bold text-[#1D1D1F] text-base">99.2% Clean Pass</span>
            <p className="text-[10px] text-[#6E6E73] mt-0.5">0.8% auto-escalated</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block">LLM-as-Judge Verifications</span>
            <span className="font-bold text-[#0050FF] text-base">4.2K Autonomous</span>
            <p className="text-[10px] text-[#6E6E73] mt-0.5">Zero human tag lag</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Comparison Area Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5EA] pb-4">
            <div>
              <h3 className="font-bold text-base text-[#1D1D1F]">AI Spend vs. Unoptimized Baseline</h3>
              <p className="text-xs text-[#86868B]">Daily invoice trajectory across all active API keys</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0050FF]"></span>
                <span className="text-[#1D1D1F] font-semibold">Outcome Router</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5EA]"></span>
                <span className="text-[#86868B]">GPT-4o Baseline</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0050FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0050FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#86868B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#86868B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" vertical={false} />
                <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
                <YAxis stroke="#86868B" fontSize={11} tickLine={false} tickFormatter={(v) => `${currency === "INR" ? "₹" : "$"}${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E5EA",
                    borderRadius: "1rem",
                    fontSize: "12px",
                    color: "#1D1D1F",
                    boxShadow: "0 4px 20px -2px rgba(0,0,0,0.08)"
                  }}
                  formatter={(val: number) => [`${formatCurrency(val, currency)}`, ""]}
                />
                <Area type="monotone" dataKey="baseline" stroke="#D2D2D7" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" name="Baseline" />
                <Area type="monotone" dataKey="actual" stroke="#0050FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" name="Outcome Router" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Traffic Share Pie Chart */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm flex flex-col justify-between space-y-6">
          <div className="border-b border-[#E5E5EA] pb-4">
            <h3 className="font-bold text-base text-[#1D1D1F]">Model Traffic Allocation</h3>
            <p className="text-xs text-[#86868B]">Thompson Pareto distribution</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelShareData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {modelShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E5E5EA",
                    borderRadius: "1rem",
                    fontSize: "11px",
                    color: "#1D1D1F"
                  }}
                  formatter={(v: number) => [`${v}%`, "Traffic Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E5E5EA]">
            {modelShareData.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }}></span>
                  <span className="text-[#515154] font-medium">{m.name}</span>
                </div>
                <span className="font-mono font-bold text-[#1D1D1F]">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outcome Benchmark Breakdown & Live Stream Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcome Win Rates per Task */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-5 lg:col-span-1">
          <div className="border-b border-[#E5E5EA] pb-3">
            <h3 className="font-bold text-base text-[#1D1D1F]">KPI Success Rates</h3>
            <p className="text-xs text-[#86868B]">Conversion rate by pipeline task</p>
          </div>

          <div className="space-y-4">
            {outcomeWinRates.map((t, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1D1D1F]">{t.task}</span>
                  <span className="font-mono text-[#0050FF] font-bold">{t.rate}%</span>
                </div>
                <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0050FF] h-full rounded-full" style={{ width: `${t.rate}%` }}></div>
                </div>
                <p className="text-[10px] text-[#86868B] font-mono">Winner: {t.model}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Router Event Stream */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Live Routed Request Stream</h3>
              <p className="text-xs text-[#86868B]">Real-time Bayesian decisions & outcome records</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#0050FF] px-2.5 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {telemetryLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] hover:border-[#0050FF]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-md">
                      {log.model_used}
                    </span>
                    <span className="text-[#86868B] font-mono text-[10px]">{log.id}</span>
                    {log.speculative_win && (
                      <span className="text-[9px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-1.5 py-0.5 rounded">
                        ⚡ Speculative Win
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#515154] truncate max-w-md font-mono">{log.prompt_preview}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[#1D1D1F] font-bold">
                      {currency === "INR" ? `₹${log.cost_inr.toFixed(3)}` : `$${log.cost_usd.toFixed(4)}`}
                    </span>
                    <p className="text-[10px] text-[#86868B]">{log.latency_ms}ms</p>
                  </div>

                  {log.outcome_success === true ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold text-[10px] border border-[#0050FF]/20">
                      Outcome Won
                    </span>
                  ) : log.outcome_success === false ? (
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-bold text-[10px]">
                      Outcome Lost
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white text-[#86868B] font-medium text-[10px] border border-[#E5E5EA]">
                      Pending Feedback
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
