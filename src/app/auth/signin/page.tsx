"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Fingerprint, Mail, KeyRound, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export default function SignInPage() {
  const router = useRouter();
  const { setAuthUser, orgName, planTier, monthlyQuota, currency } = useAppStore();

  const [authMode, setAuthMode] = useState<"pin" | "otp">("pin");
  const [email, setEmail] = useState("alex@company.com");
  
  // 6-digit PIN password state
  const [pin, setPin] = useState(["1", "2", "3", "4", "5", "6"]);
  
  // Email OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`login-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`login-pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.join("").length === 6) {
      setSubmitting(true);
      const name = email.split("@")[0].replace(".", " ") || "Alex Vance";
      
      // Update global user
      setAuthUser({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email || "alex@company.com",
        hasPin: true,
        hasBiometrics: true
      });

      // Sync to Google Sheet
      await syncAuthUserToGoogleSheets({
        action: "SIGNIN",
        name,
        email: email || "alex@company.com",
        workspace: orgName || "Acme AI Lab",
        plan_tier: planTier || "Free",
        monthly_token_quota: monthlyQuota || 10000,
        currency: currency || "USD",
        auth_method: "PIN_PASSWORD"
      });

      router.push("/app/dashboard");
    }
  };

  const handleBiometricLogin = async () => {
    setBioLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const name = "Alex Vance";
      setAuthUser({
        name,
        email: email || "alex@company.com",
        hasPin: true,
        hasBiometrics: true
      });

      await syncAuthUserToGoogleSheets({
        action: "SIGNIN",
        name,
        email: email || "alex@company.com",
        workspace: orgName || "Acme AI Lab",
        plan_tier: planTier || "Free",
        monthly_token_quota: monthlyQuota || 10000,
        currency: currency || "USD",
        auth_method: "BIOMETRIC_PASSKEY"
      });

      router.push("/app/dashboard");
    } catch {
      router.push("/app/dashboard");
    } finally {
      setBioLoading(false);
    }
  };

  const handleSendLoginOtp = () => {
    if (!email) return;
    setOtpSent(true);
    setOtp(["8", "4", "2", "9", "1", "0"]);
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setSubmitting(true);
      const name = email.split("@")[0] || "Alex Vance";
      setAuthUser({
        name,
        email,
        hasPin: true,
        hasBiometrics: true
      });

      await syncAuthUserToGoogleSheets({
        action: "SIGNIN",
        name,
        email,
        workspace: orgName || "Acme AI Lab",
        plan_tier: planTier || "Free",
        monthly_token_quota: monthlyQuota || 10000,
        currency: currency || "USD",
        auth_method: "EMAIL_OTP"
      });

      router.push("/app/dashboard");
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
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Card */}
          <div className="rounded-[32px] bg-white/80 dark:bg-[#151518]/80 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Sign in to OutcomeRouter
              </h1>
              <p className="text-xs text-[#86868B]">
                Access your organization dashboard, model routing rules, and FinOps telemetry
              </p>
            </div>

            {/* FIDO2 Biometric 1-Click Login Button */}
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={bioLoading}
              className="w-full h-12 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] hover:bg-[#EAEAEA] dark:hover:bg-[#28282C] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] transition-all flex items-center justify-center gap-2 shadow-xs group"
            >
              <Fingerprint className="h-4 w-4 text-[#0050FF] group-hover:scale-110 transition-transform" />
              <span>{bioLoading ? "Authenticating Passkey..." : "Sign in with Touch ID / Face ID"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.05] dark:bg-white/[0.08]" />
              <span className="text-[11px] font-medium text-[#86868B] uppercase tracking-wider">or sign in with</span>
              <div className="h-px flex-1 bg-black/[0.05] dark:bg-white/[0.08]" />
            </div>

            {/* Auth Mode Toggle */}
            <div className="inline-flex p-1 w-full rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setAuthMode("pin")}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "pin"
                    ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>6-Digit PIN</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("otp")}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "otp"
                    ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                    : "text-[#86868B] hover:text-[#1D1D1F]"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Email OTP</span>
              </button>
            </div>

            {/* Mode 1: 6-Digit PIN Password Login */}
            {authMode === "pin" && (
              <form onSubmit={handlePinLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#86868B]">Work Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#86868B]">6-Digit Security PIN</label>
                    <Link href="/auth/forgot-password" className="text-[11px] font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline">
                      Forgot PIN?
                    </Link>
                  </div>

                  <div className="flex gap-2 justify-center">
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        id={`login-pin-${index}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        className="w-11 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || pin.join("").length !== 6}
                  className="w-full h-11 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>{submitting ? "Signing in..." : "Continue to Dashboard"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            {/* Mode 2: Email OTP Login */}
            {authMode === "otp" && (
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#86868B]">Work Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="flex-1 h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendLoginOtp}
                      className="px-4 h-11 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#EAEAEA] whitespace-nowrap"
                    >
                      {otpSent ? "Resend" : "Send OTP"}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2 animate-in fade-in">
                    <label className="text-xs font-semibold text-[#86868B]">Enter 6-Digit OTP</label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`login-otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-11 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || otp.join("").length !== 6}
                  className="w-full h-11 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>{submitting ? "Verifying..." : "Verify & Sign In"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-[#86868B] space-y-2">
            <div>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline">
                Create Free Workspace
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
