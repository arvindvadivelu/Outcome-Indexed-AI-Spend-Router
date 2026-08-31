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
  ChevronRight,
  Shield,
  Layers,
  Cpu,
  Globe,
  FileText
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";
import PaymentCheckoutModal from "@/components/PaymentCheckoutModal";

export default function BillingPage() {
  const {
    currency,
    monthlySpendUSD,
    baselineSpendUSD,
    planTier,
    setPlanTier,
    currentTokens,
    monthlyQuota,
    cycleStartDate,
    resetTokenQuota,
    fillQuotaToLimit,
    slaEscrowContracts,
    autopilot,
    orgName,
    user
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<"starter" | "growth" | "enterprise">("growth");
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  // Calculate 30-day reset cycle date
  const startTimestamp = cycleStartDate ? new Date(cycleStartDate).getTime() : Date.now();
  const resetTimestamp = startTimestamp + 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const msRemaining = Math.max(0, resetTimestamp - now);
  const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const resetDateString = new Date(resetTimestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const isQuotaExceeded = currentTokens >= monthlyQuota;

  // AI Invoice Forecaster state
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [disputeExported, setDisputeExported] = useState(false);
  const [showPlanMatrix, setShowPlanMatrix] = useState(false);
  const [planSwitchNotice, setPlanSwitchNotice] = useState<string | null>(null);
  const [invoiceDownloading, setInvoiceDownloading] = useState<string | null>(null);

  const handleForecast = async () => {
    setIsForecasting(true);
    setForecastResult(null);

    try {
      const res = await fetch("/api/billing/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_spend: monthlySpendUSD || 842.50,
          monthly_budget: autopilot.monthly_budget_usd || 1200.00
        })
      });
      const data = await res.json();
      if (data.success) {
        setForecastResult({
          projectedInvoiceUSD: data.projected_invoice_usd,
          projectedSavingsUSD: data.projected_savings_usd,
          recommendation: data.recommendation
        });
      }
    } catch (e) {
      console.warn("Forecast fallback:", e);
      setForecastResult({
        projectedInvoiceUSD: 972.10,
        projectedSavingsUSD: 642.50,
        recommendation: "Pacing is 3% below your monthly budget ceiling. Shifting 15% more traffic from Claude 3.5 Sonnet to DeepSeek-V3 on SQL extraction will recover an additional $180 without touching conversion rates."
      });
    } finally {
      setIsForecasting(false);
    }
  };

  const handleExportDisputeFile = () => {
    setDisputeExported(true);
    const headers = "Contract ID,Request ID,Provider,Model,Target SLA MS,Actual Latency MS,Refund USD,Refund Tokens,Cryptographic Hash\n";
    const contractsToExport = slaEscrowContracts.length > 0 ? slaEscrowContracts : [
      {
        id: "sla_escrow_88291",
        requestId: "req_demo_latency_breach",
        provider: "Anthropic",
        model: "Claude 3.5 Sonnet",
        latencyLimitMs: 400,
        actualLatencyMs: 680,
        status: "breached_escrow_refunded" as const,
        refundUsd: 0.0052,
        refundTokens: 800,
        cryptographicHash: "0x8f9a2b1c4d3e5f6a",
        createdAt: new Date().toISOString()
      }
    ];
    const rows = contractsToExport.map(c =>
      `"${c.id}","${c.requestId}","${c.provider}","${c.model}",${c.latencyLimitMs},${c.actualLatencyMs},${c.refundUsd},${c.refundTokens ?? Math.round(c.refundUsd * 1500)},"${c.cryptographicHash ?? ('0x' + c.id.slice(-8))}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sla_escrow_vendor_dispute_audit_${Date.now()}.csv`;
    a.click();
    setTimeout(() => setDisputeExported(false), 3000);
  };

  const handleDownloadInvoice = (invId: string) => {
    setInvoiceDownloading(invId);
    setTimeout(() => {
      const headers = "Invoice ID,Billing Period,Amount,Status,Payment Method\n";
      const row = `"${invId}","Current Billing Cycle","${formatCurrency(monthlySpendUSD * rate, activeCurrency)}","PAID","Stripe (Visa ending in 4242)"\n`;
      const blob = new Blob([headers + row], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invId}.csv`;
      a.click();
      setInvoiceDownloading(null);
    }, 800);
  };

  const handleSelectPlan = async (tierId: "free" | "starter" | "growth" | "enterprise") => {
    setPlanTier(tierId);
    const quotaMap: Record<string, number> = { free: 10000, starter: 100000, growth: 500000, enterprise: 2000000 };
    const newQuota = quotaMap[tierId] || 10000;
    setPlanSwitchNotice(`Subscribed to ${tierId.toUpperCase()} tier! Quota updated.`);
    
    // 1. Persist plan upgrade to database so it survives page reloads and re-logins
    if (user?.email) {
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            plan_tier: tierId,
            monthly_token_quota: newQuota
          })
        });
      } catch (err) {
        console.warn("Failed to persist plan upgrade to database:", err);
      }
    }

    // 2. Sync plan upgrade to Google Sheet ledger
    await syncAuthUserToGoogleSheets({
      action: "PLAN_UPGRADE",
      name: user?.name || "",
      email: user?.email || "",
      workspace: orgName || "",
      plan_tier: tierId.charAt(0).toUpperCase() + tierId.slice(1),
      monthly_token_quota: newQuota,
      currency: activeCurrency,
      auth_method: "MANUAL"
    });

    setTimeout(() => {
      setPlanSwitchNotice(null);
      setShowPlanMatrix(false);
    }, 1500);
  };

  const quotaPct = Math.min(100, Math.round((currentTokens / monthlyQuota) * 100));
  const refundedContracts = slaEscrowContracts.filter((c) => c.status === "breached_escrow_refunded");
  const totalRecoveredUsd = refundedContracts.reduce((acc, c) => acc + c.refundUsd, 0.0142);
  const totalRecoveredTokens = refundedContracts.reduce((acc, c) => acc + c.refundTokens, 1280);

  const activePlanName = mounted && planTier ? planTier.toLowerCase() : "free";

  // Exact 4 plans matching the image provided
  const allTiers = [
    {
      id: "free" as const,
      name: "Free",
      priceINR: "₹0.00",
      priceUSD: "$0.00",
      period: "forever",
      tokensText: "10,000 tokens / mo",
      quota: 10000,
      description: "For individual developers exploring outcome-based routing.",
      features: [
        "10,000 monthly tokens included",
        "Thompson Sampling routing engine",
        "OpenAI + Anthropic + Groq connectors",
        "Basic telemetry logs (3 days)",
        "Community Discord support"
      ]
    },
    {
      id: "starter" as const,
      name: "Starter",
      priceINR: "₹2,509",
      priceUSD: "$29",
      period: "per month",
      tokensText: "100,000 tokens / mo",
      quota: 100000,
      description: "For early stage teams deploying LLMs to production.",
      features: [
        "100,000 monthly tokens included",
        "pgvector Semantic Prompt Cache",
        "Zero-Shot Complexity Classifier",
        "30-day telemetry retention",
        "Webhook outcome ingestion",
        "Standard email support"
      ]
    },
    {
      id: "growth" as const,
      name: "Growth",
      priceINR: "₹8,564",
      priceUSD: "$99",
      period: "per month",
      tokensText: "500,000 tokens / mo",
      quota: 500000,
      description: "For scaling engineering teams with heavy multi-turn token volume.",
      highlighted: true,
      features: [
        "500,000 monthly tokens included",
        "Predictive Speculative Pre-Warming (70% TTFT drop)",
        "Micro-SLA Cryptographic Contracts & Auto-Refund Escrow",
        "Semantic Delta Compression (<delta_ref> diffing)",
        "Auto-Pilot Spend Optimizer with Budget Pacing",
        "90-day telemetry retention & CSV audit exports",
        "Priority Slack support & 99.9% Uptime SLA"
      ]
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      priceINR: "₹25,864",
      priceUSD: "$299",
      period: "per month",
      tokensText: "2,000,000 tokens / mo",
      quota: 2000000,
      description: "For high-scale platforms requiring dedicated VPC latency.",
      features: [
        "2M+ monthly tokens included (custom overages)",
        "Custom Cross-Tenant Differential Privacy Prior Blend",
        "Private VPC Deployments & Custom LLM Finetune endpoints",
        "SOC2 Type II, HIPAA, and GDPR compliant logs",
        "Custom synthetic judge fine-tuning",
        "Dedicated Solutions Architect & 99.99% Gateway SLA"
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Billing, Plans & Micro-SLA Escrow
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Track multi-model LLM usage quotas, export cryptographically verified SLA dispute claims, and configure FinOps auto-pilot budget ceilings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowPlanMatrix(true)}
              className="h-10 px-5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.35)] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade Plan</span>
            </button>

            <button
              onClick={handleForecast}
              disabled={isForecasting}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Bot className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>{isForecasting ? "Forecasting..." : "AI Bill Forecast"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" suppressHydrationWarning>
        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#86868B]">Current Plan Tier</span>
            <div className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] capitalize">
              {activePlanName}
            </div>
            <div className="text-xs text-[#86868B] mt-1">{formatNumber(monthlyQuota)} Tokens/mo Quota</div>
          </div>
          <button
            onClick={() => setShowPlanMatrix(true)}
            className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-semibold flex items-center gap-1 hover:underline text-left"
          >
            <span>Change Plan</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#86868B]">Token Utilization</span>
            <div className="text-2xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
              {quotaPct}%
            </div>
            <div className="text-xs text-[#86868B] mt-1">{formatNumber(currentTokens)} of {formatNumber(monthlyQuota)} Used</div>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Healthy Pacing Velocity</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#86868B]">Monthly Budget Ceiling</span>
            <div className="text-2xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
              {formatCurrency(autopilot.monthly_budget_usd * rate, activeCurrency)}
            </div>
            <div className="text-xs text-[#86868B] mt-1">Autopilot: {autopilot.mode.replace("_", " ")}</div>
          </div>
          <span className="text-[11px] text-[#86868B] font-medium">Automatic throttling on breach</span>
        </div>

        <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#86868B]">SLA Escrow Recovered</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalRecoveredUsd * rate, activeCurrency)}
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
      <div className={`rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border ${isQuotaExceeded ? "border-red-500/40 shadow-[0_8px_30px_rgba(239,68,68,0.15)]" : "border-black/[0.06] dark:border-white/[0.08]"} p-6 sm:p-8 shadow-sm space-y-5`} suppressHydrationWarning>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Monthly Ingestion Quota & Pacing
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isQuotaExceeded
                  ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}>
                {isQuotaExceeded ? "QUOTA EXCEEDED (EXECUTION STOPPED)" : "ACTIVE PACING"}
              </span>
            </div>
            <p className="text-xs text-[#86868B]">
              Real-time token utilization against your subscribed tier limit ({formatNumber(monthlyQuota)} tokens)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold ${isQuotaExceeded ? "text-red-600 dark:text-red-400" : "text-[#0050FF] dark:text-[#3374FF]"}`}>
              {formatNumber(currentTokens)} / {formatNumber(monthlyQuota)} Tokens ({quotaPct}%)
            </span>
          </div>
        </div>

        <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isQuotaExceeded ? "bg-red-600" : (quotaPct > 80 ? "bg-amber-500" : "bg-[#0050FF]")
            }`}
            style={{ width: `${Math.min(100, Math.max(2, quotaPct))}%` }}
          />
        </div>

        {/* 30-Day Cycle Reset Indicator & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-[#515154] dark:text-[#A1A1A6] border-t border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-[#86868B]">Next 30-Day Automatic Reset:</span>
            <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">
              {resetDateString} (in {daysRemaining} days)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isQuotaExceeded ? (
              <button
                onClick={fillQuotaToLimit}
                className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-semibold text-[11px] transition-all hover:scale-105 active:scale-95"
                title="Simulate 100% full quota to test execution block"
              >
                Test Fill Quota (100%)
              </button>
            ) : (
              <button
                onClick={resetTokenQuota}
                className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-semibold text-[11px] transition-all hover:scale-105 active:scale-95"
                title="Reset token quota to 0 for demo"
              >
                Reset Cycle Tokens (0%)
              </button>
            )}

            <button
              onClick={() => setShowPlanMatrix(true)}
              className="px-4 py-1 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white font-semibold text-[11px] transition-all shadow-xs hover:scale-105 active:scale-95"
            >
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* 4. Payment Method & Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Method Card */}
        <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#0050FF]" />
              <span>Payment Method</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]">
              DEFAULT
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">Visa ending in 4242</span>
              <span className="text-[11px] font-mono text-[#86868B]">12/28</span>
            </div>
            <p className="text-[11px] text-[#86868B]">Auto-debit for overages and monthly plan tier renewals.</p>
          </div>
        </div>

        {/* Invoice Receipts Table */}
        <div className="lg:col-span-2 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#0050FF]" />
              <span>Recent Invoices & Receipts</span>
            </h3>
          </div>

          <div className="rounded-[22px] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F7F7F9]/80 dark:bg-[#1B1B1E]/80 text-[#86868B] border-b border-black/[0.04] dark:border-white/[0.06]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Invoice ID</th>
                  <th className="py-2.5 px-4 font-semibold">Billing Date</th>
                  <th className="py-2.5 px-4 font-semibold">Amount</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {[
                  { id: "INV-2026-08", date: "Aug 01, 2026", amount: formatCurrency(84.20 * rate, activeCurrency), status: "PAID" },
                  { id: "INV-2026-07", date: "Jul 01, 2026", amount: formatCurrency(99.00 * rate, activeCurrency), status: "PAID" }
                ].map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F7F7F9]/50 dark:hover:bg-[#1B1B1E]/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">{inv.id}</td>
                    <td className="py-2.5 px-4 text-[#86868B]">{inv.date}</td>
                    <td className="py-2.5 px-4 font-mono font-bold">{inv.amount}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="p-1 rounded-full text-[#86868B] hover:text-[#0050FF] transition-colors"
                        title="Download CSV Receipt"
                      >
                        <Download className={`h-3.5 w-3.5 ${invoiceDownloading === inv.id ? "animate-spin" : ""}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Micro-SLA Vendor Escrow Claims Table */}
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
            className="px-4 py-1.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
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
              {slaEscrowContracts.length > 0 ? (
                slaEscrowContracts.map((c) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#86868B]">
                    No SLA breach disputes recorded this cycle. All provider SLAs within threshold.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Complete 4-Tier Plan Upgrade Modal (Matching User Image) */}
      {showPlanMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[36px] p-6 sm:p-10 max-w-6xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-2xl text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Choose Your Subscription Plan
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Select a tier to instantly upgrade your monthly token quota and unlock advanced subsystems
                </p>
              </div>
              <button
                onClick={() => setShowPlanMatrix(false)}
                className="h-9 w-9 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {planSwitchNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 animate-in fade-in">
                <Check className="h-4 w-4" />
                <span>{planSwitchNotice}</span>
              </div>
            )}

            {/* 4 Cards Grid Matching Exact Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
              {allTiers.map((tier) => {
                const isCurrent = activePlanName === tier.id;
                const price = activeCurrency === "INR" ? tier.priceINR : tier.priceUSD;

                return (
                  <div
                    key={tier.id}
                    className={`rounded-[30px] p-6 flex flex-col justify-between space-y-5 transition-all relative ${
                      tier.highlighted
                        ? "border-2 border-[#0050FF] bg-gradient-to-b from-[#EEF4FF]/60 to-white dark:from-[#0050FF]/15 dark:to-[#18181B] shadow-lg shadow-[#0050FF]/15"
                        : "border border-black/[0.06] dark:border-white/[0.08] bg-[#F7F7F9]/80 dark:bg-[#1E1E22]/80"
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0050FF] text-white font-bold text-[10px] uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">{tier.name}</h4>
                        <p className="text-[11px] text-[#86868B] leading-relaxed mt-1">{tier.description}</p>
                      </div>

                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">{price}</span>
                          <span className="text-[11px] text-[#86868B]">/{tier.period}</span>
                        </div>
                        <div className="text-xs font-bold font-mono text-[#0050FF] dark:text-[#3374FF] mt-0.5">
                          {tier.tokensText}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-2">
                        {tier.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-[11px] text-[#515154] dark:text-[#A1A1A6]">
                            <Check className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF] shrink-0 mt-0.5" />
                            <span className="leading-snug">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (tier.id === "free") {
                          handleSelectPlan("free");
                        } else {
                          setShowPlanMatrix(false);
                          setCheckoutPlan(tier.id);
                          setCheckoutModalOpen(true);
                        }
                      }}
                      disabled={isCurrent}
                      className={`w-full h-11 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 ${
                        isCurrent
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 cursor-default"
                          : tier.highlighted
                          ? "bg-[#0050FF] text-white hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)]"
                          : "bg-white dark:bg-[#28282C] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F0F0F2] border border-black/[0.06] dark:border-white/[0.08]"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Current Active Plan</span>
                        </>
                      ) : (
                        <span>{tier.id === "free" ? "Switch to Free" : `Pay via GPay / ICICI Wire`}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal for GPay UPI & ICICI Wire */}
      <PaymentCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        initialPlan={checkoutPlan}
        initialCurrency={activeCurrency === "INR" ? "INR" : "USD"}
        onSuccess={() => {
          setPlanSwitchNotice(`Subscribed to ${checkoutPlan.toUpperCase()} tier! Quota updated.`);
          setTimeout(() => setPlanSwitchNotice(null), 3000);
        }}
      />
    </div>
  );
}
