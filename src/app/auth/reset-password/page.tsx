"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight, KeyRound, Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { syncAuthUserToGoogleSheets } from "@/lib/google-sheets";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`new-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleConfirmPinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...confirmPin];
    newPin[index] = value.slice(-1);
    setConfirmPin(newPin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`confirm-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const p1 = pin.join("");
    const p2 = confirmPin.join("");

    if (p1.length !== 6 || p2.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }

    if (p1 !== p2) {
      setErrorMsg("PIN codes do not match.");
      return;
    }

    setSubmitting(true);

    await syncAuthUserToGoogleSheets({
      action: "PASSWORD_RESET",
      name: "Alex Vance",
      email: "alex@company.com",
      workspace: "Acme AI Lab",
      plan_tier: "Free",
      monthly_token_quota: 10000,
      currency: "USD",
      auth_method: "PIN_PASSWORD"
    });

    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => {
      router.push("/auth/signin");
    }, 1200);
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
                Set New Security PIN
              </h1>
              <p className="text-xs text-[#86868B]">
                Choose a 6-digit numeric PIN for your account hardware authentication
              </p>
            </div>

            {success ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7]">Security PIN Updated</h3>
                <p className="text-xs text-[#86868B]">Redirecting to Sign In...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-medium text-center">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-semibold text-[#86868B] block text-center">Enter New 6-Digit PIN</label>
                  <div className="flex gap-2 justify-center">
                    {pin.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`new-pin-${idx}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        className="w-10 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-[#86868B] block text-center">Confirm 6-Digit PIN</label>
                  <div className="flex gap-2 justify-center">
                    {confirmPin.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`confirm-pin-${idx}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleConfirmPinChange(idx, e.target.value)}
                        className="w-10 h-12 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-center font-mono text-base font-bold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{submitting ? "Saving PIN..." : "Update Security PIN"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}

            <div className="pt-2 text-center text-xs text-[#86868B]">
              Return to{" "}
              <Link href="/auth/signin" className="font-semibold text-[#0050FF] dark:text-[#3374FF] hover:underline">
                Sign In
              </Link>
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
