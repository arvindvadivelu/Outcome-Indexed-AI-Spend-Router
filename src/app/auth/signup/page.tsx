"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Building, Check, Sparkles, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignUpPage() {
  const router = useRouter();
  const { setAuthUser, setOrgName, setPlanTier, currency } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "growth" | "enterprise">("free");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qPlan = params.get("plan");
      if (qPlan && ["free", "starter", "growth", "enterprise"].includes(qPlan.toLowerCase())) {
        setSelectedPlan(qPlan.toLowerCase() as any);
      }
      const qEmail = params.get("email");
      if (qEmail) {
        setEmail(qEmail);
      }
      const qWorkspace = params.get("workspace") || params.get("org");
      if (qWorkspace) {
        setWorkspace(qWorkspace);
      }
    }
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspace, setWorkspace] = useState("");
  
  // 6-digit PIN state
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeCurrency = mounted ? currency : "USD";

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setErrorMessage(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`signup-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`signup-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newPin = [...pin];
    for (let i = 0; i < pasted.length; i++) {
      newPin[i] = pasted[i];
    }
    setPin(newPin);
    setErrorMessage(null);
    const focusIndex = Math.min(5, pasted.length);
    document.getElementById(`signup-pin-${focusIndex}`)?.focus();
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const pinCode = pin.join("");
    if (!name.trim() || !email.trim() || pinCode.length !== 6) {
      setErrorMessage("Please complete your name, email, and 6-digit security PIN.");
      return;
    }

    setSubmitting(true);

    const org = workspace.trim() || `${name.split(" ")[0]}'s Workspace`;

    try {
      // Call register API which persists in database & triggers Google Sheets real-time sync
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          workspace: org,
          plan_tier: selectedPlan,
          pin: pinCode,
          currency: activeCurrency
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create account.");
        setSubmitting(false);
        return;
      }

      // Update global client store
      setAuthUser({
        name: data.user.name,
        email: data.user.email,
        hasPin: true,
        hasBiometrics: true
      });
      setOrgName(data.user.workspace);
      setPlanTier(data.user.plan_tier || selectedPlan);
      useAppStore.setState({
        currentTokens: 0,
        logs: [],
        slaEscrowContracts: [],
        monthlySpendUSD: 0,
        baselineSpendUSD: 0,
        currency: activeCurrency,
        apiKeys: data.user.apiKeys || [],
        hasConfiguredBudget: false,
        isBudgetSetupModalOpen: true,
        autopilot: {
          enabled: true,
          mode: "optimal_pace",
          burn_ratio: 0.00,
          monthly_budget_usd: 0,
          projected_spend_usd: 0.00,
          cost_weight_w2: 25.0,
          quality_weight_w1: 0.70
        }
      });

      setRegisteredSuccess(true);
      setTimeout(() => {
        router.push("/app/dashboard");
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to communicate with registration server.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col justify-between selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      {/* Top Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center shadow-sm shadow-[#0050FF]/25">
            <Zap className="h-4 w-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">OutcomeRouter</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-[32px] bg-white/80 dark:bg-[#151518]/80 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Free Plan · 10,000 Monthly Tokens</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Create Your Organization
              </h1>
              <p className="text-xs text-[#86868B]">
                Deploy outcome-indexed routing with instant drop-in SDK access
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Alex Vance"
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="alex@company.com"
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Organization / Workspace Name</label>
                <input
                  type="text"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="Acme AI Lab"
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                />
              </div>

              {/* Set 6-Digit PIN */}
              <div className="space-y-2 pt-2">
                <label className="font-semibold text-[#86868B] block text-center">Set 6-Digit Security PIN</label>
                <div className="flex gap-2 justify-center">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`signup-pin-${index}`}
                      type="password"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      onPaste={handlePinPaste}
                      className="w-10 sm:w-11 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              {registeredSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  <span>Workspace registered & synced to Google Sheet! Redirecting...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !name || !email || pin.join("").length !== 6}
                className="w-full h-12 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{submitting ? "Registering & Syncing Sheet..." : "Create Workspace & Launch"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs text-[#86868B] space-y-2">
            <div>
              Already have a workspace?{" "}
              <Link href="/auth/signin" className="font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline">
                Sign In
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-[#86868B] pt-1">
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <span>•</span>
              <Link href="/dpa" className="hover:underline">DPA</Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#86868B] border-t border-black/[0.04] dark:border-white/[0.06]">
        Outcome-Indexed AI Spend Router · 256-bit TLS Gateway
      </footer>
    </div>
  );
}
