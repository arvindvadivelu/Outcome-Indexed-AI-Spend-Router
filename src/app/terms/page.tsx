"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileText,
  Activity,
  ShieldCheck,
  FileCheck,
  Scale,
  Mail
} from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-28 flex-1 space-y-12 w-full" suppressHydrationWarning>
        {/* 1. Header */}
        <section className="space-y-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <FileText className="h-3.5 w-3.5" />
            <span>Service Terms &amp; Enterprise SLA Commitments</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
            Terms of Service &amp; Enterprise SLA
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Last modified: August 29, 2026 · Valid for all active API keys and organization tenants
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/privacy"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              href="/dpa"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Data Processing Addendum (DPA)</span>
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Legal &amp; Sales</span>
            </Link>
          </div>
        </section>

        {/* 2. SLA Summary 4-Card Bento Grid */}
        <section className="p-8 sm:p-10 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0050FF]" />
            <span>Guaranteed Uptime &amp; Micro-SLA Nonces</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B] uppercase font-mono text-[10px] block">Gateway Uptime</span>
              <div className="text-xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">99.99% SLA</div>
              <p className="text-[11px] text-[#86868B]">Global Anycast multi-region mesh</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B] uppercase font-mono text-[10px] block">Auto-Refund Limit</span>
              <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">&lt;250ms P95</div>
              <p className="text-[11px] text-[#86868B]">Zero-loss fallback escrow</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B] uppercase font-mono text-[10px] block">Service Credit</span>
              <div className="text-xl font-extrabold font-mono text-purple-600 dark:text-purple-400">100% Refund</div>
              <p className="text-[11px] text-[#86868B]">Automatic ledger chargeback</p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="text-[#86868B] uppercase font-mono text-[10px] block">Cancellation</span>
              <div className="text-xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Anytime</div>
              <p className="text-[11px] text-[#86868B]">Self-serve 1-click in console</p>
            </div>
          </div>
        </section>

        {/* 3. Detailed Legal Text */}
        <section className="space-y-8 text-xs leading-relaxed text-[#515154] dark:text-[#A1A1A6]">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">1. Acceptance of Terms</h3>
            <p>
              By provisioning an API key or integrating the OutcomeRouter SDK with your software applications, you agree to comply with these Terms of Service and all applicable regional laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">2. Micro-SLA Contracts &amp; Automatic Escrow</h3>
            <p>
              Every request dispatched through the OutcomeRouter Gateway generates a cryptographic SHA-256 micro-SLA commitment. In the event an upstream foundation model provider fails to return within your configured latency threshold or reports server error (HTTP 5xx), the gateway automatically reroutes to a secondary hot-slot model with 100% refund credited to your tenant ledger.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">3. Acceptable Use Policy</h3>
            <p>
              You agree not to use OutcomeRouter to generate content in violation of upstream provider safety policies or applicable laws. Any activity that intentionally degrades network integrity or attempts to circumvent tenant boundaries is strictly prohibited.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">4. Termination &amp; Account Cancellation</h3>
            <p>
              You may cancel your subscription at any time via the billing console. Upon cancellation, your API keys will remain active until the conclusion of your current billing period.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
