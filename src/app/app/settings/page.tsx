"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Sliders,
  Building,
  Shield,
  CreditCard,
  Lock,
  Download,
  RotateCcw,
  Trash2,
  Check,
  Zap,
  Globe,
  SlidersHorizontal,
  Bot,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  DollarSign,
  Clock,
  Database,
  X
} from "lucide-react";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export default function SettingsPage() {
  const {
    orgName,
    setOrgName,
    planTier,
    currency,
    setCurrency,
    autopilot,
    setAutopilotMode,
    setMonthlyBudget,
    federationSettings,
    toggleFederation,
    setFederationWeight,
    user,
    updateUserProfile,
    clearUserData,
    loadDemoData
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  const [activeTab, setActiveTab] = useState<"general" | "finops" | "sla" | "security" | "danger">("general");

  // Form states
  const [workspaceName, setWorkspaceName] = useState(orgName || "Acme AI Lab");
  const [workspaceSlug, setWorkspaceSlug] = useState("acme-ai-lab");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [defaultStrategy, setDefaultStrategy] = useState("outcome_optimized");
  const [defaultFallback, setDefaultFallback] = useState("GPT-4o");
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(autopilot.monthly_budget_usd || 1500);
  const [alertThreshold, setAlertThreshold] = useState(85);
  const [autoThrottleOnCeiling, setAutoThrottleOnCeiling] = useState(true);
  const [slaLatencyLimit, setSlaLatencyLimit] = useState(250);
  const [minWinRateRequired, setMinWinRateRequired] = useState(92);
  const [privacyEpsilon, setPrivacyEpsilon] = useState(federationSettings.epsilon || 0.5);
  const [enforceMfa, setEnforceMfa] = useState(true);
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(24);

  const [savedNotice, setSavedNotice] = useState(false);
  const [exportedNotice, setExportedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Delete Account States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    if (orgName) setWorkspaceName(orgName);
  }, [orgName]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgName(workspaceName);
    if (user && contactEmail) {
      updateUserProfile(user.name, contactEmail);
    }
    setMonthlyBudget(monthlyBudgetLimit);

    // 1. Persist workspace and user profile to database
    const targetEmail = user?.email || contactEmail;
    if (targetEmail) {
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            workspace: workspaceName,
            name: user?.name,
            currency: activeCurrency
          })
        });
      } catch (err) {
        console.warn("Failed to persist workspace settings to database:", err);
      }
    }

    // 2. Sync to Google Sheet with correct plan quota
    const planQuotaMap: Record<string, number> = { free: 10000, starter: 100000, growth: 500000, enterprise: 2000000 };
    const currentQuota = planQuotaMap[planTier || "free"] || 10000;
    await syncAuthUserToGoogleSheets({
      action: "PLAN_UPGRADE",
      name: user?.name || "",
      email: contactEmail,
      workspace: workspaceName,
      plan_tier: planTier || "free",
      monthly_token_quota: currentQuota,
      currency: activeCurrency,
      auth_method: "MANUAL"
    });

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportWorkspaceData = () => {
    setExportedNotice(true);
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      organization: workspaceName,
      slug: workspaceSlug,
      planTier,
      currency: activeCurrency,
      finops: {
        budgetUSD: monthlyBudgetLimit,
        autopilotMode: autopilot.mode,
        alertThresholdPct: alertThreshold,
        autoThrottle: autoThrottleOnCeiling
      },
      slaPolicies: {
        maxLatencyMs: slaLatencyLimit,
        minWinRate: minWinRateRequired,
        defaultFallback
      },
      privacy: {
        differentialPrivacyEpsilon: privacyEpsilon,
        federatedSharing: federationSettings.enabled,
        sessionTimeoutHours
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workspaceSlug}_workspace_configuration_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => setExportedNotice(false), 3000);
  };

  const handleConfirmReset = () => {
    clearUserData();
    setShowResetConfirm(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      setDeleteError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const userEmail = user?.email || contactEmail;
      if (!userEmail) {
        setDeleteError("Cannot determine account email. Please refresh and try again.");
        setIsDeleting(false);
        return;
      }
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.error || "Failed to delete account. Please try again.");
        setIsDeleting(false);
        return;
      }

      setDeleteSuccess(true);
      setTimeout(() => {
        clearUserData();
        useAppStore.getState().logout();
        if (typeof window !== "undefined") {
          window.localStorage.clear();
          window.location.href = "/";
        }
      }, 1200);
    } catch (err: any) {
      setDeleteError(err.message || "Network error deleting account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* 1. Spatial Hero Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]" suppressHydrationWarning>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#0050FF]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Organization & Gateway Settings
            </h1>
            <p className="text-sm text-[#86868B] max-w-2xl leading-relaxed">
              Configure enterprise routing defaults, FinOps budget enforcement, micro-SLA thresholds, and security compliance policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Currency Quick Switcher */}
            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md shadow-inner">
              {(["USD", "INR"] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all hover:scale-105 active:scale-95 ${
                    activeCurrency === curr
                      ? "bg-[#0050FF] text-white shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {curr === "USD" ? "$ USD" : "₹ INR"}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportWorkspaceData}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs hover:scale-105 active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>{exportedNotice ? "Exported!" : "Export Config JSON"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Settings Navigation Capsule */}
      <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md overflow-x-auto" suppressHydrationWarning>
        {[
          { id: "general", label: "General & Routing" },
          { id: "finops", label: "FinOps & Guardrails" },
          { id: "sla", label: "Micro-SLA & Escrow" },
          { id: "security", label: "Security & Privacy" },
          { id: "danger", label: "Danger Zone" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap hover:scale-105 active:scale-95 ${
              activeTab === tab.id
                ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Content */}
      <form onSubmit={handleSaveGeneral} className="space-y-6">
        {/* TAB 1: General & Routing Defaults */}
        {activeTab === "general" && (
          <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in" suppressHydrationWarning>
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Workspace Identity & Gateway Defaults
                </h3>
                <p className="text-xs text-[#86868B]">Global settings applied to all inbound API calls unless overridden</p>
              </div>
              {savedNotice && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  ✓ Settings Saved
                </span>
              )}
            </div>

            {/* Quick Strategy Preset Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#86868B]">Quick Strategy Presets:</label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Cost-Minimal", strategy: "cost_minimum", fallback: "DeepSeek-V3" },
                  { label: "Outcome-Optimized", strategy: "outcome_optimized", fallback: "GPT-4o" },
                  { label: "Latency-First (Sub-100ms)", strategy: "latency_first", fallback: "DeepSeek-V3" },
                  { label: "Frontier Reasoning", strategy: "quality_maximum", fallback: "Claude 3.5 Sonnet" }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDefaultStrategy(preset.strategy);
                      setDefaultFallback(preset.fallback);
                    }}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all hover:scale-105 active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Organization Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => {
                    setWorkspaceName(e.target.value);
                    setWorkspaceSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                  }}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Workspace Slug (URL namespace)</label>
                <input
                  type="text"
                  value={workspaceSlug}
                  onChange={(e) => setWorkspaceSlug(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Primary Billing Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Default Routing Strategy</label>
                <select
                  value={defaultStrategy}
                  onChange={(e) => setDefaultStrategy(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none cursor-pointer"
                >
                  <option value="outcome_optimized">Outcome-Optimized (Bayesian Thompson)</option>
                  <option value="cost_minimum">Cost-Minimum (Lowest Price Frontier)</option>
                  <option value="latency_first">Latency-First (Sub-100ms LPU Routing)</option>
                  <option value="quality_maximum">Quality-Maximum (Frontier Reasoning)</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-[#86868B]">Default Fallback Model (Circuit Breaker)</label>
                <select
                  value={defaultFallback}
                  onChange={(e) => setDefaultFallback(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none cursor-pointer"
                >
                  <option value="GPT-4o">OpenAI GPT-4o</option>
                  <option value="Claude 3.5 Sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="DeepSeek-V3">DeepSeek-V3 Native</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: FinOps & Budget Guardrails */}
        {activeTab === "finops" && (
          <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in" suppressHydrationWarning>
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  FinOps Budget Ceilings & Auto-Pilot Guardrails
                </h3>
                <p className="text-xs text-[#86868B]">Enforce hard spending caps, automatic model shifting, and email pacing alerts</p>
              </div>
            </div>

            {/* Quick Budget Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#86868B]">Quick Budget Limits:</label>
              <div className="flex flex-wrap items-center gap-2">
                {[500, 1000, 1500, 3000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setMonthlyBudgetLimit(amt)}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all hover:scale-105 active:scale-95"
                  >
                    {formatCurrency(amt * rate, activeCurrency)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Monthly Budget Ceiling ({activeCurrency})</label>
                <input
                  type="number"
                  value={monthlyBudgetLimit}
                  onChange={(e) => setMonthlyBudgetLimit(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-mono font-bold text-sm text-[#0050FF] dark:text-[#3374FF] focus:outline-none"
                  min="100"
                  step="50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-[#86868B]">Warning Alert Threshold</label>
                  <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">{alertThreshold}%</span>
                </div>
                <input
                  type="range"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 80)}
                  className="w-full accent-[#0050FF] h-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg mt-3 cursor-pointer"
                  min="50"
                  max="95"
                  step="5"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="font-semibold text-[#86868B]">Auto-Pilot Autonomous Pacing Strategy</label>
                <div className="inline-flex p-1 w-full rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
                  {(["optimal_pace", "aggressive_savings", "quality_boost"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setAutopilotMode(m)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-full capitalize transition-all hover:scale-105 active:scale-95 ${
                        autopilot.mode === m
                          ? "bg-[#0050FF] text-white shadow-xs"
                          : "text-[#86868B] hover:text-[#1D1D1F]"
                      }`}
                    >
                      {m.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] md:col-span-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Auto-Throttle on Budget Breach</span>
                  <p className="text-[11px] text-[#86868B]">Shift 100% of fallback traffic to lowest-cost models when ceiling is reached</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoThrottleOnCeiling}
                  onChange={(e) => setAutoThrottleOnCeiling(e.target.checked)}
                  className="h-5 w-5 accent-[#0050FF] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save FinOps Policies</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Micro-SLA & Escrow */}
        {activeTab === "sla" && (
          <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in" suppressHydrationWarning>
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Micro-SLA Escrow & Cryptographic Guarantees
                </h3>
                <p className="text-xs text-[#86868B]">Define latency and win-rate requirements for upstream model providers</p>
              </div>
            </div>

            {/* Quick SLA Profile Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#86868B]">Quick SLA Profiles:</label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Real-Time Chat (<150ms)", latency: 150, winRate: 90 },
                  { label: "General Production (<250ms)", latency: 250, winRate: 92 },
                  { label: "Deep Reasoning (<800ms)", latency: 800, winRate: 96 }
                ].map((prof, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSlaLatencyLimit(prof.latency);
                      setMinWinRateRequired(prof.winRate);
                    }}
                    className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] hover:border-[#0050FF]/30 transition-all hover:scale-105 active:scale-95"
                  >
                    {prof.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Max Latency SLA Ceiling (ms)</label>
                <input
                  type="number"
                  value={slaLatencyLimit}
                  onChange={(e) => setSlaLatencyLimit(parseInt(e.target.value) || 250)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  min="50"
                  max="1000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Minimum Required Outcome Win Rate (%)</label>
                <input
                  type="number"
                  value={minWinRateRequired}
                  onChange={(e) => setMinWinRateRequired(parseInt(e.target.value) || 90)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  min="80"
                  max="99"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save SLA Thresholds</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Security & Privacy */}
        {activeTab === "security" && (
          <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in" suppressHydrationWarning>
            <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Security, Privacy & Federated Consensus
                </h3>
                <p className="text-xs text-[#86868B]">Manage differential privacy parameter ε, zero-egress VPC controls, and authentication</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2 p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Differential Privacy Noise Budget (ε = {privacyEpsilon})</span>
                    <p className="text-[11px] text-[#86868B]">Calibrates Laplacian noise scale added to model loss matrices</p>
                  </div>
                  <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">ε={privacyEpsilon}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={privacyEpsilon}
                  onChange={(e) => setPrivacyEpsilon(parseFloat(e.target.value))}
                  className="w-full accent-[#0050FF] h-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg mt-2 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Federated Prior Sharing</span>
                  <p className="text-[11px] text-[#86868B]">Contribute noise-injected model outcome win rates to 480+ cross-tenant collective priors</p>
                </div>
                <input
                  type="checkbox"
                  checked={federationSettings.enabled}
                  onChange={toggleFederation}
                  className="h-5 w-5 accent-[#0050FF] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Enforce Hardware FIDO2 / WebAuthn MFA</span>
                  <p className="text-[11px] text-[#86868B]">Require all team members to authenticate with Touch ID, Face ID, or YubiKey</p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceMfa}
                  onChange={(e) => setEnforceMfa(e.target.checked)}
                  className="h-5 w-5 accent-[#0050FF] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Session Idle Timeout</span>
                  <p className="text-[11px] text-[#86868B]">Automatic session invalidation on inactivity</p>
                </div>
                <select
                  value={sessionTimeoutHours}
                  onChange={(e) => setSessionTimeoutHours(parseInt(e.target.value))}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-[#28282C] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold cursor-pointer"
                >
                  <option value={1}>1 Hour</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={168}>7 Days</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Security Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Danger Zone */}
        {activeTab === "danger" && (
          <div className="rounded-[32px] bg-red-50/50 dark:bg-red-950/20 border border-red-500/20 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in" suppressHydrationWarning>
            <div className="border-b border-red-500/20 pb-4">
              <h3 className="text-base font-bold text-red-600 dark:text-red-400 tracking-tight flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Workspace Danger Zone</span>
              </h3>
              <p className="text-xs text-[#86868B]">Irreversible actions affecting telemetry logs, model routing priors, and API credentials</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1E1E22] border border-red-500/20">
                <div>
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">Reset All Telemetry & Priors</span>
                  <span className="text-[11px] text-[#86868B]">Wipes recorded logs, cached delta tokens, and resets Dirichlet priors to neutral</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Clean Slate</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1E1E22] border border-red-500/20">
                <div>
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] block">Load Multi-Model Benchmark Sample Telemetry</span>
                  <span className="text-[11px] text-[#86868B]">Populates simulated traces for DeepSeek-V3, Groq Llama 3.3, Claude 3.5 Sonnet</span>
                </div>
                <button
                  type="button"
                  onClick={loadDemoData}
                  className="px-4 py-2 rounded-full bg-[#0050FF] text-white font-semibold hover:bg-[#0043D6] transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Load Sample Telemetry</span>
                </button>
              </div>

              {/* Delete Account Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#1E1E22] border-2 border-red-500/30 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                      Permanently Delete Account & Organization
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868B] max-w-xl leading-relaxed">
                    Permanently purges your account ({user?.email || contactEmail}), security PIN, workspace settings, token history from our database, and dispatches deletion to Google Sheets ledger.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmText("");
                    setDeleteError(null);
                    setShowDeleteConfirm(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-105 active:scale-95 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-red-500/30 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                Confirm Clean Slate Reset
              </h3>
            </div>
            <p className="text-xs text-[#86868B] leading-relaxed">
              This action will purge all recorded gateway traces, Bayesian Thompson priors, and cached token metrics. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 h-10 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-xs hover:scale-105 active:scale-95"
              >
                Confirm Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Double Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border-2 border-red-500/40 rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Delete Account & Data?
                </h3>
                <span className="text-[11px] text-red-500 font-semibold uppercase tracking-wider">
                  Irreversible Action
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#86868B] leading-relaxed">
              <p>
                Are you sure you want to permanently delete your account{" "}
                <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">
                  ({user?.email || contactEmail})
                </strong>?
              </p>
              <p className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[11px] border border-red-500/20">
                ⚠️ All user credentials, security PIN, workspace telemetry, and records in our <strong>local database</strong> and <strong>Google Sheets ledger</strong> will be permanently wiped.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1.5">
                  Type <span className="text-red-600 font-mono">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full h-10 px-4 rounded-xl bg-[#F5F5F7] dark:bg-[#242428] border border-black/[0.08] dark:border-white/[0.1] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-500 text-[#1D1D1F] dark:text-[#F5F5F7]"
                  disabled={isDeleting || deleteSuccess}
                />
              </div>

              {deleteError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600 text-[11px] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {deleteSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Account deleted successfully from database and Google Sheets! Redirecting...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) setShowDeleteConfirm(false);
                }}
                disabled={isDeleting || deleteSuccess}
                className="px-4 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteSuccess || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                className="px-5 h-10 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className={`h-3.5 w-3.5 ${isDeleting ? "animate-spin" : ""}`} />
                <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
