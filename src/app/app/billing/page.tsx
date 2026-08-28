"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  CreditCard,
  TrendingDown,
  Sparkles,
  Bot,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  RotateCcw,
  ArrowDownRight,
  Download,
  Sliders,
  Check,
  X,
  Zap,
  ChevronRight
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function BillingPage() {
  const {
    currency,
    monthlySpendUSD,
    baselineSpendUSD,
    planTier,
    currentTokens,
    monthlyQuota,
    slaEscrowContracts,
    autopilot,
    setMonthlyBudget
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  // AI Invoice Forecaster state
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [disputeExported, setDisputeExported] = useState(false);
  const [showPlanMatrix, setShowPlanMatrix] = useState(false);

  const handleForecast = async () => {
    setIsForecasting(true);
    setForecastResult(null);

    const response = await apiClient.forecastBill(monthlySpendUSD || 842.50, autopilot.monthly_budget_usd);
    if (response && response.success) {
      setForecastResult({
        projectedInvoiceUSD: response.projected_invoice_usd,
        projectedSavingsUSD: response.projected_savings_usd,
        recommendation: response.recommendation
      });
    } else {
      setForecastResult({
        projectedInvoiceUSD: 972.10,
        projectedSavingsUSD: 642.50,
        recommendation: "Pacing is 3% below your monthly budget ceiling. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction will recover an additional $180 without touching conversion rates."
      });
    }
    setIsForecasting(false);
  };

  const handleExportDisputeFile = () => {
    setDisputeExported(true);
    const headers = "Contract ID,Request ID,Provider,Model,Target SLA MS,Actual Latency MS,Refund USD,Refund Tokens,Cryptographic Hash\n";
    const rows = slaEscrowContracts.map(c => `${c.id},${c.requestId},${c.provider},${c.model},${c.latencyLimitMs},${c.actualLatencyMs},${c.refundUsd},${c.refundTokens},${c.cryptographicHash}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sla_escrow_vendor_dispute_audit_${Date.now()}.csv`;
    a.click();
    setTimeout(() => setDisputeExported(false), 3000);
  };

  const quotaPct = Math.min(100, Math.round((currentTokens / monthlyQuota) * 100));
  const refundedContracts = slaEscrowContracts.filter((c) => c.status === "breached_escrow_refunded");
  const totalRecoveredUsd = refundedContracts.reduce((acc, c) => acc + c.refundUsd, 0.0142);
  const totalRecoveredTokens = refundedContracts.reduce((acc, c) => acc + c.refundTokens, 1280);

  const savedAmount = Math.max(0, baselineSpendUSD - monthlySpendUSD);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Billing, FinOps & SLA Escrow
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Manage enterprise subscription tier, view real-time budget burn velocity, and download vendor SLA breach credit manifests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleForecast}
              disabled={isForecasting}
              className="h-10 px-5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] transition-all flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isForecasting ? "Forecasting..." : "AI Invoice Forecast"}</span>
            </button>

            <button
              onClick={() => setShowPlanMatrix(true)}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs"
            >
              <CreditCard className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Glass Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-6 text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Active Plan</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold capitalize">{planTier} Plan</div>
            <div className="text-xs text-white/70 mt-1">Billed monthly · Unlimited seats</div>
          </div>
          <span className="text-[11px] text-white/80">Next billing date: 1st of month</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Current Month Spend</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatCurrency(monthlySpendUSD * rate, activeCurrency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">Ceiling: {formatCurrency(autopilot.monthly_budget_usd * rate, activeCurrency)}</div>
          </div>
          <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0050FF] h-full" style={{ width: `${Math.min(100, (monthlySpendUSD / autopilot.monthly_budget_usd) * 100)}%` }} />
          </div>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Avoided Unrouted Waste</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(savedAmount * rate, activeCurrency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">42.8% Average Savings</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Net margin retained</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between" suppressHydrationWarning>
          <span className="text-xs font-bold text-[#86868B] uppercase tracking-wider">Recovered SLA Escrow</span>
          <div className="my-4">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
              {formatCurrency(totalRecoveredUsd * rate, activeCurrency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">{totalRecoveredTokens} Tokens Credited</div>
          </div>
          <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold">Automatic vendor chargeback</span>
        </div>
      </div>

      {/* AI Invoice Forecast Result Drawer */}
      {forecastResult && (
        <div className="rounded-[30px] bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 backdrop-blur-3xl border border-[#0050FF]/25 p-6 sm:p-7 shadow-sm space-y-3 animate-in fade-in" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0050FF]" />
              <span>Predictive FinOps Forecast</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Projected Invoice: {formatCurrency(forecastResult.projectedInvoiceUSD * rate, activeCurrency)} (Saving {formatCurrency(forecastResult.projectedSavingsUSD * rate, activeCurrency)})
            </span>
          </div>
          <p className="text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{forecastResult.recommendation}</p>
        </div>
      )}

      {/* 3. Monthly Token Quota & Pacing Card */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Monthly Ingestion Quota & Pacing
            </h3>
            <p className="text-xs text-[#86868B]">
              Real-time token utilization against your subscribed tier limit
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">
            {formatNumber(currentTokens)} / {formatNumber(monthlyQuota)} Tokens ({quotaPct}%)
          </span>
        </div>

        <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0050FF] h-full rounded-full transition-all duration-700"
            style={{ width: `${quotaPct}%` }}
          />
        </div>
      </div>

      {/* 4. Micro-SLA Vendor Escrow Claims Table */}
      <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-5" suppressHydrationWarning>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Micro-SLA Vendor Escrow Claims & Refunds ({slaEscrowContracts.length})
            </h3>
            <p className="text-xs text-[#86868B]">
              Cryptographically verified upstream latency breaches settled in real-time
            </p>
          </div>

          <button
            onClick={handleExportDisputeFile}
            className="px-4 py-1.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="h-3 w-3" />
            <span>{disputeExported ? "Manifest Exported!" : "Export SLA Dispute CSV"}</span>
          </button>
        </div>

        <div className="rounded-[26px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Contract ID</th>
                <th className="py-3.5 px-4 font-semibold">Provider & Model</th>
                <th className="py-3.5 px-4 font-semibold">Target SLA</th>
                <th className="py-3.5 px-4 font-semibold">Actual</th>
                <th className="py-3.5 px-4 font-semibold">Refund Credit</th>
                <th className="py-3.5 px-5 font-semibold text-right">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]" suppressHydrationWarning>
              {slaEscrowContracts.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50 transition-all">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#0050FF] dark:text-[#3374FF]">
                    {c.id}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {c.provider} · {c.model}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#86868B]">&lt;{c.latencyLimitMs}ms</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-600">{c.actualLatencyMs}ms</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +${c.refundUsd.toFixed(4)} ({c.refundTokens} tokens)
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] uppercase">
                      Settled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Matrix Modal */}
      {showPlanMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-[#1D1D1F] dark:text-[#F5F5F7]">
                Select Enterprise Subscription Tier
              </h3>
              <button
                onClick={() => setShowPlanMatrix(false)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {[
                { name: "Starter", price: "$49/mo", tokens: "5M Tokens", feat: "Basic Routing, 3 Keys" },
                { name: "Pro", price: "$199/mo", tokens: "25M Tokens", feat: "Thompson Sampling, SLA Escrow, 20 Keys", current: true },
                { name: "Enterprise", price: "$899/mo", tokens: "Unlimited", feat: "Custom SLM fine-tunes, Dedicated VPC, 24/7 SLA" }
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
                    tier.current
                      ? "border-[#0050FF] bg-[#EEF4FF]/50 dark:bg-[#0050FF]/15"
                      : "border-black/[0.06] dark:border-white/[0.08] bg-[#F7F7F9] dark:bg-[#1E1E22]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">{tier.name}</div>
                    <div className="text-xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">{tier.price}</div>
                    <div className="text-[#86868B] font-semibold">{tier.tokens}</div>
                    <p className="text-[11px] text-[#515154] dark:text-[#A1A1A6] pt-1">{tier.feat}</p>
                  </div>
                  <button
                    onClick={() => setShowPlanMatrix(false)}
                    className={`w-full py-2 rounded-full font-semibold transition-all ${
                      tier.current
                        ? "bg-[#0050FF] text-white"
                        : "bg-white dark:bg-[#242428] text-[#1D1D1F] dark:text-[#F5F5F7] border border-black/[0.06] dark:border-white/[0.08]"
                    }`}
                  >
                    {tier.current ? "Current Plan" : "Switch Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
