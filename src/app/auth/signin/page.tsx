"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Fingerprint, Mail, KeyRound, CheckCircle2, Shield } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignInPage() {
  const router = useRouter();
  const { setAuthUser } = useAppStore();

  const [authMode, setAuthMode] = useState<"pin" | "otp">("pin");
  const [email, setEmail] = useState("");
  
  // 6-digit PIN password state
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  
  // Email OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

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

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.join("").length === 6) {
      setAuthUser({
        name: email.split("@")[0] || "Alex Vance",
        email: email || "alex@company.com",
        hasPin: true,
        hasBiometrics: true
      });
      router.push("/app/dashboard");
    }
  };

  const handleBiometricLogin = async () => {
    setBioLoading(true);
    try {
      // Simulate WebAuthn Biometric Scan
      await new Promise((r) => setTimeout(r, 700));
      setAuthUser({
        name: "Alex Vance",
        email: email || "alex@company.com",
        hasPin: true,
        hasBiometrics: true
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
  };

  const handleOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setAuthUser({
        name: email.split("@")[0] || "Alex Vance",
        email: email || "alex@company.com",
        hasPin: true,
        hasBiometrics: true
      });
      router.push("/app/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0D0D0E] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#0050FF] selection:text-white transition-colors">
      {/* Top Left Theme Toggle */}
      <div className="absolute top-6 left-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 px-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0050FF] shadow-sm shadow-[#0050FF]/25">
            <Zap className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs sm:text-sm text-[#86868B]">
          Sign in with your 6-digit password PIN, Fingerprint, or Email OTP
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#161618] py-8 px-6 sm:px-8 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          
          {/* Mode Switcher */}
          <div className="flex p-1 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23]">
            <button
              type="button"
              onClick={() => setAuthMode("pin")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                authMode === "pin"
                  ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>6-Digit PIN</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("otp")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 ${
                authMode === "otp"
                  ? "bg-white dark:bg-[#2C2C30] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email OTP</span>
            </button>
          </div>

          {/* MODE 1: Direct 6-Digit Password PIN */}
          {authMode === "pin" && (
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Work Email</label>
                <input
                  required
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] px-4 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    6-Digit Password PIN (Numeric)
                  </label>
                  <Link href="/auth/forgot-password" className="text-[11px] text-[#0050FF] hover:underline">
                    Forgot PIN?
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`login-pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      className="w-10 h-12 text-center text-base font-bold font-mono rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] focus:bg-white dark:focus:bg-[#161618] focus:ring-2 focus:ring-[#0050FF]/20 transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={pin.join("").length !== 6}
                className="w-full py-2.5 rounded-full bg-[#0050FF] disabled:opacity-40 text-white font-semibold text-xs hover:bg-[#0043D6] transition-all shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-1.5"
              >
                <span>Sign In with PIN</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              {/* Fingerprint / Biometric 1-Click Login Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={bioLoading}
                  className="w-full py-2.5 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] hover:bg-[#EBEBEF] dark:hover:bg-[#2A2A30] border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Fingerprint className="h-4 w-4 text-[#0050FF]" />
                  <span>{bioLoading ? "Verifying Touch ID..." : "Sign In with Fingerprint / Touch ID"}</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: Email OTP Login */}
          {authMode === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Work Email</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="email"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-10 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] px-4 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleSendLoginOtp}
                    disabled={!email}
                    className="px-4 h-10 rounded-full bg-[#0050FF] disabled:opacity-40 text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shrink-0"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <form onSubmit={handleOtpLogin} className="space-y-4 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 text-[11px] text-[#0050FF] dark:text-[#3374FF]">
                    Code sent to <strong>{email}</strong> (Simulated OTP: <strong>849201</strong>)
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block text-center mb-2">
                      Enter 6-Digit OTP
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`login-otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 h-12 text-center text-base font-bold font-mono rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF] focus:bg-white dark:focus:bg-[#161618] focus:ring-2 focus:ring-[#0050FF]/20 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={otp.join("").length !== 6}
                    className="w-full py-2.5 rounded-full bg-[#0050FF] disabled:opacity-40 text-white font-semibold text-xs hover:bg-[#0043D6] transition-all shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-1.5"
                  >
                    <span>Sign In with OTP</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 text-center text-xs text-[#86868B]">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-[#0050FF] font-medium hover:underline">
              Create account (with 6-digit PIN & Fingerprint)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
