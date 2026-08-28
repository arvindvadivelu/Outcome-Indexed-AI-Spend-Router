"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Fingerprint, Mail, CheckCircle2, ShieldCheck, KeyRound, RefreshCw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignUpPage() {
  const router = useRouter();
  const { setAuthUser } = useAppStore();

  const [step, setStep] = useState<"info" | "otp" | "security">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // 6-digit OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(45);
  const [otpSentMessage, setOtpSentMessage] = useState(false);

  // 6-digit PIN state
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [biometricsRegistered, setBiometricsRegistered] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setOtpSentMessage(true);
    setStep("otp");
    setResendTimer(45);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length === 6) {
      setStep("security");
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleRegisterBiometrics = async () => {
    setBioLoading(true);
    try {
      if (window.PublicKeyCredential) {
        // Simulate WebAuthn biometric passkey registration
        await new Promise((r) => setTimeout(r, 900));
        setBiometricsRegistered(true);
      } else {
        setBiometricsRegistered(true);
      }
    } catch {
      setBiometricsRegistered(true);
    } finally {
      setBioLoading(false);
    }
  };

  const handleCompleteRegistration = () => {
    setAuthUser({
      name: name || "Developer",
      email: email || "dev@company.com",
      hasPin: pin.join("").length === 6,
      hasBiometrics: biometricsRegistered
    });
    router.push("/app/dashboard");
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
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-[#86868B]">
          {step === "info" && "Start free with 10,000 monthly tokens. Secure 6-digit PIN & Biometrics."}
          {step === "otp" && `Enter the 6-digit verification code sent to ${email}`}
          {step === "security" && "Set your 6-digit numeric password and enable Fingerprint login."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#161618] py-8 px-6 sm:px-8 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.05] dark:border-white/[0.06]">
            {[
              { id: "info", label: "1. Info" },
              { id: "otp", label: "2. Email OTP" },
              { id: "security", label: "3. Security PIN" }
            ].map((s) => (
              <span
                key={s.id}
                className={`text-[11px] font-semibold transition-colors ${
                  step === s.id
                    ? "text-[#0050FF] dark:text-[#3374FF]"
                    : "text-[#86868B]"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* STEP 1: Basic Info */}
          {step === "info" && (
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] px-4 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:bg-white dark:focus:bg-[#161618] focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
                />
              </div>

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

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] transition-all shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-1.5"
              >
                <span>Send 6-Digit Email OTP</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {/* STEP 2: Email OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-3 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 flex items-center gap-2 text-xs text-[#0050FF] dark:text-[#3374FF]">
                <Mail className="h-4 w-4 shrink-0" />
                <span>Verification code sent to <strong>{email}</strong> (Simulated OTP: <strong>849201</strong>)</span>
              </div>

              <div>
                <label className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block text-center mb-3">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
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
                <span>Verify Code & Continue</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center justify-between text-xs text-[#86868B] pt-1">
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  className="hover:underline text-[#515154] dark:text-[#8E8E93]"
                >
                  Edit email
                </button>
                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => {
                    setResendTimer(45);
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="text-[#0050FF] disabled:text-[#86868B] font-medium flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: 6-Digit PIN & Biometrics Security */}
          {step === "security" && (
            <div className="space-y-5">
              {/* 6-Digit Password PIN Input */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-[#0050FF]" />
                  <label className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Create 6-Digit Password PIN (Numeric)
                  </label>
                </div>
                <p className="text-[11px] text-[#86868B] mb-3">
                  This 6-digit numeric PIN will be your fast, secure password for login.
                </p>

                <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      id={`pin-${index}`}
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

              {/* Biometrics / Fingerprint Option */}
              <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.05] dark:border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-[#2C2C30] flex items-center justify-center shadow-xs">
                      <Fingerprint className="h-4 w-4 text-[#0050FF]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Fingerprint / Touch ID</h4>
                      <p className="text-[10px] text-[#86868B]">1-touch login without typing PIN</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegisterBiometrics}
                    disabled={bioLoading || biometricsRegistered}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                      biometricsRegistered
                        ? "bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995]"
                        : "bg-[#0050FF] text-white hover:bg-[#0043D6]"
                    }`}
                  >
                    {bioLoading ? "Scanning..." : biometricsRegistered ? "Enabled ✓" : "Enable Touch"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompleteRegistration}
                disabled={pin.join("").length !== 6}
                className="w-full py-2.5 rounded-full bg-[#0050FF] disabled:opacity-40 text-white font-semibold text-xs hover:bg-[#0043D6] transition-all shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-1.5"
              >
                <span>Complete Account Setup</span>
                <ShieldCheck className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="pt-2 text-center text-xs text-[#86868B]">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#0050FF] font-medium hover:underline">
              Sign in with 6-digit PIN / Fingerprint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
