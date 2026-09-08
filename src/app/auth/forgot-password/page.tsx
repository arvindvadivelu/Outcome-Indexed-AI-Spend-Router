"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight, Mail, KeyRound, Check, AlertCircle, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`forgot-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setErrorMessage(null);
    const focusIndex = Math.min(5, pasted.length);
    document.getElementById(`forgot-otp-${focusIndex}`)?.focus();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your registered work email.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to dispatch OTP. Please verify your email.");
        setSubmitting(false);
        return;
      }

      setOtpSent(true);
      setSuccessMessage(`One-time security code dispatched to ${email}. Code: ${data.otp}`);
      setOtp(data.otp.split(""));
      setSubmitting(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact authorization gateway.");
      setSubmitting(false);
    }
  };

  const handleVerifyAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpCode })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Invalid OTP code entered.");
        setSubmitting(false);
        return;
      }

      // Sync audit event to Google Sheet
      await syncAuthUserToGoogleSheets({
        action: "PASSWORD_RESET",
        name: data.user.name || email.split("@")[0] || "User",
        email: email.trim().toLowerCase(),
        workspace: data.user.workspace || "Acme AI Lab",
        plan_tier: data.user.plan_tier || "Free",
        monthly_token_quota: data.user.monthly_token_quota || 10000,
        currency: "USD",
        auth_method: "EMAIL_OTP"
      });

      router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify OTP.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col justify-between selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center shadow-sm shadow-[#0050FF]/25">
            <Zap className="h-4 w-4 stroke-[2.5]" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">OutcomeRouter</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-[32px] bg-white/80 dark:bg-[#151518]/80 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Reset Security PIN
              </h1>
              <p className="text-xs text-[#86868B]">
                Enter your work email to receive a 6-digit one-time authorization code
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Work Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="alex@company.com"
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !email}
                  className="w-full h-11 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{submitting ? "Sending Code..." : "Send 6-Digit OTP"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndProceed} className="space-y-4 text-xs animate-in fade-in">
                <div className="space-y-2">
                  <label className="font-semibold text-[#86868B] block text-center">Enter 6-Digit OTP</label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`forgot-otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || otp.join("").length !== 6}
                  className="w-full h-11 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{submitting ? "Verifying..." : "Verify & Set New PIN"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full py-2 text-xs font-semibold text-[#86868B] hover:text-[#0050FF] transition-all flex items-center justify-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Change Email or Resend Code</span>
                </button>
              </form>
            )}

            <div className="pt-2 text-center text-xs text-[#86868B]">
              Remember your PIN?{" "}
              <Link href="/auth/signin" className="font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#86868B] pt-1">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/dpa" className="hover:underline">DPA</Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-[#86868B] border-t border-black/[0.04] dark:border-white/[0.06]">
        Outcome-Indexed AI Spend Router · 256-bit TLS Gateway
      </footer>
    </div>
  );
}
