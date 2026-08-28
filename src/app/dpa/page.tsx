"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe
} from "lucide-react";

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20 flex-1 space-y-10 w-full" suppressHydrationWarning>
        <div className="space-y-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Standard Contractual Clauses & GDPR Article 28 Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Data Processing Addendum (DPA)
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Binding EU SCCs, UK International Data Transfer Addendum & CCPA Service Provider Guarantees
          </p>
        </div>

        {/* 1. Subprocessor Compliance Bento Card */}
        <section className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0050FF]" />
            <span>Authorized AI Subprocessors & Gateways</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Anthropic, PBC & OpenAI, LLC</span>
              <p className="text-[#86868B] leading-relaxed">
                Zero data retention enterprise API agreements with encrypted in-flight payload dispatch.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Groq, Inc. & DeepSeek AI</span>
              <p className="text-[#86868B] leading-relaxed">
                Stateless LPU / GPU inference pipelines governed under EU Standard Contractual Clauses.
              </p>
            </div>
          </div>
        </section>

        {/* 2. DPA Clauses */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">1. Scope & Applicability</h3>
            <p>
              This Data Processing Addendum governs the processing of personal data submitted by the customer through the OutcomeRouter API gateway under applicable data protection legislation (GDPR, CCPA, LGPD).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">2. Customer Instructions</h3>
            <p>
              OutcomeRouter processes customer prompt payloads solely in accordance with documented customer instructions conveyed via API parameters, headers, and dashboard routing policies.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">3. Security Measures & SOC 2 Auditing</h3>
            <p>
              We implement industry-standard technical and organizational measures (TOMs), including TLS 1.3 encryption, ephemeral memory buffers, and annual third-party SOC 2 Type II audits.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
