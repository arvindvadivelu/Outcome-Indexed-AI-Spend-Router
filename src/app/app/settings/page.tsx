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
  Sparkles
} from "lucide-react";

export default function SettingsPage() {
  const {
    orgName,
    setOrgName,
    planTier,
    currency,
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

  const [activeTab, setActiveTab] = useState<"general" | "finops" | "sla" | "security" | "danger">("general");

  // Form states
  const [workspaceName, setWorkspaceName] = useState(orgName || "Acme AI Lab");
  const [workspaceSlug, setWorkspaceSlug] = useState("acme-ai-lab");
  const [contactEmail, setContactEmail] = useState(user?.email || "alex@company.com");
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

  useEffect(() => {
    if (orgName) setWorkspaceName(orgName);
  }, [orgName]);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgName(workspaceName);
    if (user && contactEmail) {
      updateUserProfile(user.name, contactEmail);
    }
    setMonthlyBudget(monthlyBudgetLimit);
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
        federatedSharing: federationSettings.enabled
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

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportWorkspaceData}
              className="h-10 px-5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center gap-2 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>{exportedNotice ? "Exported!" : "Export Workspace"}</span>
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
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Organization Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-medium text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Workspace Slug</label>
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
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                >
                  <option value="outcome_optimized">Outcome-Optimized (Bayesian Thompson)</option>
                  <option value="cost_minimum">Cost-Minimum (Lowest Price Frontier)</option>
                  <option value="latency_first">Latency-First (Sub-100ms LPU Routing)</option>
                  <option value="quality_maximum">Quality-Maximum (Frontier Reasoning)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Default Fallback Model (Circuit Breaker)</label>
                <select
                  value={defaultFallback}
                  onChange={(e) => setDefaultFallback(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
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
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Monthly Budget Ceiling (USD)</label>
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
                <label className="font-semibold text-[#86868B]">Warning Alert Threshold (%)</label>
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 80)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  min="50"
                  max="95"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#86868B]">Auto-Pilot Autonomous Pacing Strategy</label>
                <div className="inline-flex p-1 w-full rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80">
                  {(["optimal_pace", "aggressive_savings", "quality_boost"] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setAutopilotMode(m)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-full capitalize transition-all ${
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

              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
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
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5"
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
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5"
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
                <p className="text-xs text-[#86868B]">Manage differential privacy parameter $\varepsilon$, zero-egress VPC controls, and authentication</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Federated Prior Sharing (ε={privacyEpsilon})</span>
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
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="h-11 px-7 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5"
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
                  onClick={clearUserData}
                  className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 transition-all flex items-center gap-1.5"
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
                  className="px-4 py-2 rounded-full bg-[#0050FF] text-white font-semibold hover:bg-[#0043D6] transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Load Sample Telemetry</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
