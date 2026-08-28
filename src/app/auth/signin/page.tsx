"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#0050FF] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0050FF] shadow-sm shadow-[#0050FF]/25">
            <Zap className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
          Sign In
        </h2>
        <p className="text-xs sm:text-sm text-[#86868B]">
          Access your AI spend telemetry and routing dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-black/[0.06] shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#1D1D1F] block mb-1">Work Email</label>
              <input
                required
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-full bg-[#F5F5F7] border border-transparent px-4 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#1D1D1F]">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-[#0050FF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-full bg-[#F5F5F7] border border-transparent px-4 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] transition-all shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-1.5"
            >
              <span>Sign In to Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#86868B]">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-[#0050FF] font-medium hover:underline">
              Create one for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
