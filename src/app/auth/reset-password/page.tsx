"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, CheckCircle2, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#0050FF] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0050FF] shadow-apple-blue">
            <Zap className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
          Choose a New Password
        </h2>
        <p className="text-xs sm:text-sm text-[#6E6E73]">
          Must be at least 8 characters with a number and special symbol
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-black/[0.06] shadow-apple-lg space-y-6">
          {success ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="h-12 w-12 rounded-2xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-[#1D1D1F]">Password Successfully Updated</h3>
              <p className="text-xs text-[#6E6E73]">You can now log in with your new credentials.</p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">New Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] px-3.5 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Confirm New Password</label>
                <input
                  required
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] px-3.5 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] transition-all shadow-apple-blue flex items-center justify-center gap-2"
              >
                <span>Update Password</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
