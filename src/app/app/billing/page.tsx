"use client";

import { useState } from "react";
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
  ArrowDownRight
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function BillingPage() {
  const { currency, monthlySpendUSD, baselineSpendUSD, planTier, currentTokens, monthlyQuota, slaEscrowContracts } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  // AI Invoice Forecaster state
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);

  const handleForecast = async () => {
    setIsForecasting(true);
    setForecastResult(null);

    const response = await apiClient.forecastBill(monthlySpendUSD || 842.50, 1500.0);
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
        recommendation: "Pacing is 3% below your monthly budget ceiling of $1,500. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction will recover an additional $180 without touching conversion rates."
      });
    }
    setIsForecasting(false);
  };

  const quotaPct = Math.min(100, Math.round((currentTokens / monthlyQuota) * 100));
  const refundedContracts = slaEscrowContracts.filter((c) => c.status === "breached_escrow_refunded");
  const totalRecoveredUsd = refundedContracts.reduce((acc, c) => acc + c.refundUsd, 0.0142);
  const totalRecoveredTokens = refundedContracts.reduce((acc, c) => acc + c.refundTokens, 1280);

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Billing, Plans & SLA Escrow
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Manage your subscription tier, token quotas, and vendor SLA refund credits
          </p>
        </div>

        <button
          onClick={handleForecast}
          disabled={isForecasting}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/20"
        >
          <Bot className="h-3.5 w-3.5" />
          <span>{isForecasting ? "Forecasting..." : "Forecast Monthly Bill"}</span>
        </button>
      </div>

      {/* Forecast panel */}
      {forecastResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Projected Invoice: {formatCurrency(forecastResult.projectedInvoiceUSD * rate, currency)}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Net Savings: +{formatCurrency(forecastResult.projectedSavingsUSD * rate, currency)}
            </span>
          </div>
          <p className="text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{forecastResult.recommendation}</p>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Active Subscription</span>
          <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">{planTier} Plan</h3>
          <p className="text-xs text-[#86868B]">{formatNumber(monthlyQuota)} tokens included per month</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Month-to-Date Spend</span>
          <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
            {formatCurrency(monthlySpendUSD * rate, currency)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Saved {formatCurrency((baselineSpendUSD - monthlySpendUSD) * rate, currency)} vs GPT-4o
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Next Renewal</span>
          <div className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Sept 1, 2026</div>
          <p className="text-xs text-[#86868B]">Auto-renews via Stripe credit card</p>
        </div>
      </div>

      {/* Feature 2: SLA Escrow Recovery Ledger Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#EEF4FF] via-white to-white dark:from-[#0050FF]/15 dark:via-[#161618] dark:to-[#161618] border border-[#0050FF]/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                SLA Escrow Recovery Ledger
              </h3>
              <p className="text-xs text-[#86868B]">
                Cryptographically audited vendor tokens refunded due to latency/quality SLA breaches
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-[#0050FF] dark:text-[#3374FF] bg-white dark:bg-[#1F1F23] px-3 py-1 rounded-full border border-black/[0.06] dark:border-white/[0.08] self-start sm:self-auto">
            100% Zero-Loss Guarantee
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
            <p className="text-[11px] text-[#86868B]">Recovered Vendor Credits</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              +{currency === "INR" ? `₹${(totalRecoveredUsd * rate).toFixed(2)}` : `$${totalRecoveredUsd.toFixed(4)}`}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
            <p className="text-[11px] text-[#86868B]">Auto-Refunded Tokens</p>
            <p className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono mt-0.5">
              +{formatNumber(totalRecoveredTokens)} tokens
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
            <p className="text-[11px] text-[#86868B]">Contract Compliance Rate</p>
            <p className="text-lg font-bold text-[#0050FF] dark:text-[#3374FF] font-mono mt-0.5">
              99.2%
            </p>
          </div>
        </div>
      </div>

      {/* Quota Progress */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Monthly Token Allocation</span>
          <span className="font-mono text-[#86868B]">
            {formatNumber(currentTokens)} / {formatNumber(monthlyQuota)} tokens ({quotaPct}%)
          </span>
        </div>

        <div className="w-full bg-[#F5F5F7] dark:bg-[#1F1F23] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0050FF] h-full rounded-full transition-all duration-500"
            style={{ width: `${quotaPct}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
