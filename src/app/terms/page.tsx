"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Activity,
  Zap,
  ShieldCheck,
  FileCheck,
  Scale,
  Mail
} from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 flex-1 space-y-10 w-full" suppressHydrationWarning>
        {/* 1. Spatial Header */}
        <div className="space-y-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" />
            <span>Service Terms & Enterprise SLA Commitments</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Terms of Service & Enterprise SLA
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Last modified: August 29, 2026 • Valid for all active API keys and organization tenants
          </p>

          {/* Quick Legal Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/privacy"
              className="px-4 py-2 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              href="/dpa"
              className="px-4 py-2 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
            >
              <FileCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Data Processing Addendum (DPA)</span>
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Legal & Sales</span>
            </Link>
          </div>
        </div>

        {/* 2. SLA Summary 4-Card Bento Grid */}
        <section className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0050FF]" />
            <span>Guaranteed Uptime & Micro-SLA Nonces</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">Gateway Uptime</span>
              <div className="text-xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">99.99% SLA</div>
              <p className="text-[10px] text-[#86868B]">Global Anycast multi-region mesh</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">Auto-Refund Limit</span>
              <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">&lt;250ms P95</div>
              <p className="text-[10px] text-[#86868B]">Zero-loss fallback escrow</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">Service Credit</span>
              <div className="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400">100% Refund</div>
              <p className="text-[10px] text-[#86868B]">Automatic ledger chargeback</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B]">Cancellation Policy</span>
              <div className="text-xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Anytime</div>
              <p className="text-[10px] text-[#86868B]">Self-serve 1-click in console</p>
            </div>
          </div>
        </section>

        {/* 3. Terms Articles */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">1. Acceptance of Terms</h3>
            <p>
              By provisioning an API key or integrating the OutcomeRouter SDK with your software applications, you agree to comply with these Terms of Service and all applicable regional laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">2. Acceptable Use Policy</h3>
            <p>
              You agree not to use OutcomeRouter to route requests that violate upstream model provider terms (OpenAI, Anthropic, DeepSeek), attempt denial-of-service vectors, or bypass contractual rate limits.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">3. Cryptographic Nonces and Dispute Resolution</h3>
            <p>
              OutcomeRouter provides deterministic cryptographic proofs for every routed prompt. In the event of a vendor SLA dispute, our audit manifest serves as the verifiable source of truth for upstream chargeback claims.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">4. Subscription Billing & Quota Cycles</h3>
            <p>
              Subscriptions renew monthly or annually based on selected tier. Monthly token quotas reset automatically every 30 days from account creation date. Unused quotas do not roll over.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
