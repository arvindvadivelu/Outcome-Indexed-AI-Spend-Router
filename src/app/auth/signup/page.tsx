"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Fingerprint, Mail, CheckCircle2, ShieldCheck, KeyRound, Building, Check, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export default function SignUpPage() {
  const router = useRouter();
  const { setAuthUser, setOrgName, setPlanTier, currency } = useAppStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "growth" | "enterprise">("free");
  
  // 6-digit PIN state
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || pin.join("").length !== 6) return;

    setSubmitting(true);

    const org = workspace.trim() || `${name.split(" ")[0]}'s Workspace`;
    const quota = selectedPlan === "free" ? 10000 : (selectedPlan === "starter" ? 100000 : (selectedPlan === "growth" ? 500000 : 2000000));

    // Update global store
    setAuthUser({
      name: name.trim(),
      email: email.trim(),
      hasPin: true,
      hasBiometrics: true
    });
    setOrgName(org);
    setPlanTier(selectedPlan);

    // Sync to Google Sheets online spreadsheet
    await syncAuthUserToGoogleSheets({
      action: "SIGNUP",
      name: name.trim(),
      email: email.trim(),
      workspace: org,
      plan_tier: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
      monthly_token_quota: quota,
      currency: currency || "USD",
      auth_method: "PIN_PASSWORD"
    });

    setRegisteredSuccess(true);
    setTimeout(() => {
      router.push("/app/dashboard");
    }, 800);
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
        <div className="w-full max-w-lg space-y-6">
          <div className="rounded-[32px] bg-white/80 dark:bg-[#151518]/80 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Start Free · 10,000 Monthly Tokens</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Create Your Organization
              </h1>
              <p className="text-xs text-[#86868B]">
                Deploy outcome-indexed routing with instant drop-in SDK access
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                    required
                  />
                </div>
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

              {/* Initial Subscription Tier Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-[#86868B]">Select Initial Subscription Tier</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {[
                    { id: "free", name: "Free", quota: "10K tokens", price: "₹0 /mo" },
                    { id: "starter", name: "Starter", quota: "100K tokens", price: "₹2,509 /mo" },
                    { id: "growth", name: "Growth", quota: "500K tokens", price: "₹8,564 /mo" },
                    { id: "enterprise", name: "Enterprise", quota: "2M+ tokens", price: "₹25,864 /mo" }
                  ].map((tier) => (
                    <button
                      type="button"
                      key={tier.id}
                      onClick={() => setSelectedPlan(tier.id as any)}
                      className={`p-2.5 rounded-2xl border transition-all ${
                        selectedPlan === tier.id
                          ? "border-[#0050FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] shadow-xs font-bold"
                          : "border-black/[0.05] dark:border-white/[0.06] bg-[#F7F7F9] dark:bg-[#1E1E22] text-[#86868B]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{tier.name}</div>
                      <div className="text-[10px] font-mono">{tier.quota}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Set 6-Digit PIN */}
              <div className="space-y-2 pt-2">
                <label className="font-semibold text-[#86868B] block text-center">Set 6-Digit Hardware Security PIN</label>
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
                      className="w-10 sm:w-11 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              {registeredSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  <span>Workspace initialized! Redirecting...</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !name || !email || pin.join("").length !== 6}
                className="w-full h-12 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
              >
                <span>{submitting ? "Initializing Account..." : "Create Workspace & Launch"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs text-[#86868B]">
            Already have a workspace?{" "}
            <Link href="/auth/signin" className="font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#86868B] border-t border-black/[0.04] dark:border-white/[0.06]">
        Outcome-Indexed AI Spend Router · 256-bit TLS Gateway
      </footer>
    </div>
  );
}
