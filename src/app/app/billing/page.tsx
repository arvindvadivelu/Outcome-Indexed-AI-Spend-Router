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
  Receipt
} from "lucide-react";

export default function BillingPage() {
  const { currency, monthlySpendUSD, baselineSpendUSD, planTier, currentTokens, monthlyQuota } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  // AI Invoice Forecaster state
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);

  const handleForecast = () => {
    setIsForecasting(true);
    setTimeout(() => {
      setForecastResult({
        projectedInvoiceUSD: 972.10,
        projectedSavingsUSD: 642.50,
        recommendation: "Pacing is 3% below your monthly budget ceiling of $1,500. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction will recover an additional $180 without touching conversion rates."
      });
      setIsForecasting(false);
    }, 450);
  };

  const quotaPct = Math.min(100, Math.round((currentTokens / monthlyQuota) * 100));

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Billing & Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B] mt-0.5">
            Manage your subscription tier, token quotas, and predictive spend pacing
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
        <div className="p-5 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-2 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#1D1D1F]">
              Projected Invoice: {formatCurrency(forecastResult.projectedInvoiceUSD * rate, currency)}
            </span>
            <span className="font-semibold text-emerald-600">
              Net Savings: +{formatCurrency(forecastResult.projectedSavingsUSD * rate, currency)}
            </span>
          </div>
          <p className="text-[#515154] leading-relaxed">{forecastResult.recommendation}</p>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Active Subscription</span>
          <h3 className="text-2xl font-bold text-[#1D1D1F] capitalize">{planTier} Plan</h3>
          <p className="text-xs text-[#86868B]">{formatNumber(monthlyQuota)} tokens included per month</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Month-to-Date Spend</span>
          <div className="text-2xl font-bold text-[#1D1D1F] font-mono">
            {formatCurrency(monthlySpendUSD * rate, currency)}
          </div>
          <p className="text-xs text-emerald-600 font-medium">
            Saved {formatCurrency((baselineSpendUSD - monthlySpendUSD) * rate, currency)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-medium">Next Renewal</span>
          <div className="text-2xl font-bold text-[#1D1D1F]">Sept 1, 2026</div>
          <p className="text-xs text-[#86868B]">Auto-renews via credit card</p>
        </div>
      </div>

      {/* Quota Progress */}
      <div className="p-6 rounded-2xl bg-white border border-black/[0.05] shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1D1D1F]">Token Quota Usage</span>
          <span className="font-mono text-[#0050FF] font-semibold">{quotaPct}% used</span>
        </div>
        <div className="w-full bg-[#F5F5F7] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0050FF] h-full rounded-full transition-all duration-500"
            style={{ width: `${quotaPct}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#86868B]">
          <span>{formatNumber(currentTokens)} tokens used</span>
          <span>{formatNumber(monthlyQuota)} monthly quota</span>
        </div>
      </div>
    </div>
  );
}
