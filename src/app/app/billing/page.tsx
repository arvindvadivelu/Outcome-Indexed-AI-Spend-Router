"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  TrendingDown,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle
} from "lucide-react";

export default function BillingPage() {
  const { currency, monthlySpendUSD, baselineSpendUSD, planTier } = useAppStore();
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
        recommendation: "Pacing is 3% below your monthly budget ceiling of $1,500. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction tasks will recover an additional $180 without touching conversion rates."
      });
      setIsForecasting(false);
    }, 450);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            Subscription & AI Invoice Forecaster
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1">
            Current subscription tier, payment methods, and predictive FinOps spend pacing
          </p>
        </div>

        <button
          onClick={handleForecast}
          disabled={isForecasting}
          className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Bot className="h-4 w-4" />
          <span>{isForecasting ? "Forecasting..." : "Forecast End-of-Month Invoice"}</span>
        </button>
      </div>

      {/* Forecast panel */}
      {forecastResult && (
        <div className="p-6 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-2 animate-in fade-in text-xs font-mono">
          <div className="flex items-center justify-between text-[#0050FF] font-bold">
            <span>Projected Invoice: {formatCurrency(forecastResult.projectedInvoiceUSD * rate, currency)}</span>
            <span>Net Saved: +{formatCurrency(forecastResult.projectedSavingsUSD * rate, currency)}</span>
          </div>
          <p className="text-[#515154] font-sans pt-1 leading-relaxed">{forecastResult.recommendation}</p>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-semibold uppercase font-mono">Current Active Plan</span>
          <h3 className="text-2xl font-extrabold text-[#1D1D1F] capitalize font-mono">{planTier} Plan</h3>
          <p className="text-xs text-[#6E6E73]">500,000 monthly tokens included</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-semibold uppercase font-mono">Month-to-Date Spend</span>
          <div className="text-2xl font-extrabold text-[#1D1D1F] font-mono">
            {formatCurrency(monthlySpendUSD * rate, currency)}
          </div>
          <p className="text-xs text-[#0050FF] font-mono">Saved {formatCurrency((baselineSpendUSD - monthlySpendUSD) * rate, currency)}</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-[#86868B] font-semibold uppercase font-mono">Next Renewal Date</span>
          <div className="text-2xl font-extrabold text-[#1D1D1F] font-mono">Sept 1, 2026</div>
          <p className="text-xs text-[#86868B]">Auto-renews via Stripe</p>
        </div>
      </div>
    </div>
  );
}
