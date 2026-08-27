"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0050FF] shadow-apple-blue">
            <Zap className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
          Create Your Outcome Router Account
        </h2>
        <p className="text-xs sm:text-sm text-[#6E6E73]">
          Start free with 10,000 monthly tokens. No credit card required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-black/[0.06] shadow-apple-lg space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Full Name</label>
              <input
                required
                type="text"
                placeholder="Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] px-3.5 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Work Email</label>
              <input
                required
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] px-3.5 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] px-3.5 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] transition-all shadow-apple-blue flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#86868B]">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-[#0050FF] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
