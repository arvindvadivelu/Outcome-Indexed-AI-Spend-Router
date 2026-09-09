"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  Scale,
  Server
} from "lucide-react";
import Link from "next/link";

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-28 flex-1 space-y-12 w-full" suppressHydrationWarning>
        {/* 1. Header */}
        <section className="space-y-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <FileCheck className="h-3.5 w-3.5" />
            <span>Standard Contractual Clauses &amp; GDPR Article 28 Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
            Data Processing Addendum (DPA)
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Binding EU SCCs, UK International Data Transfer Addendum &amp; CCPA Service Provider Guarantees
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch("/api/compliance/dpa-export");
                  const data = await res.json();
                  if (data.success && data.dpaAgreement) {
                    const blob = new Blob([JSON.stringify(data.dpaAgreement, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `OutcomeRouter_GDPR_DPA_${data.dpaAgreement.agreementId}.json`;
                    a.click();
                  }
                } catch (e) {
                  console.warn("DPA download fallback:", e);
                }
              }}
              className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Download Signed DPA Certificate (JSON)</span>
            </button>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Execute Custom Enterprise DPA</span>
            </Link>
            <Link
              href="/privacy"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Privacy Policy</span>
            </Link>
          </div>
        </section>

        {/* 2. Subprocessor Compliance Bento Card */}
        <section className="p-8 sm:p-10 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0050FF]" />
            <span>Authorized AI Subprocessors &amp; Gateways</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">Anthropic, PBC &amp; OpenAI, LLC</span>
              <p className="text-[#86868B] leading-relaxed">
                Zero data retention enterprise API agreements with encrypted in-flight payload dispatch.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Groq, Inc. &amp; DeepSeek AI</span>
              <p className="text-[#86868B] leading-relaxed">
                Stateless LPU / GPU inference pipelines governed under EU Standard Contractual Clauses.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-purple-600 dark:text-purple-400">Cloudflare, Inc. Edge Mesh</span>
              <p className="text-[#86868B] leading-relaxed">
                Global Anycast edge proxy routing with TLS 1.3 encryption and DDoS mitigation.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Amazon Web Services (AWS)</span>
              <p className="text-[#86868B] leading-relaxed">
                SOC 2 Type II certified VPC clusters hosting pgvector semantic prompt cache tables.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Detailed DPA Clauses */}
        <section className="space-y-8 text-xs leading-relaxed text-[#515154] dark:text-[#A1A1A6]">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">1. Scope &amp; Applicability</h3>
            <p>
              This Data Processing Addendum (&ldquo;DPA&rdquo;) supplements the OutcomeRouter Terms of Service and applies to all processing of Customer Personal Data performed in connection with the routing gateway services.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">2. Customer Instructions</h3>
            <p>
              OutcomeRouter shall process Customer Personal Data exclusively on behalf of and in accordance with the documented instructions of the Customer, including regarding data transfers outside the European Economic Area (EEA) and United Kingdom under approved Standard Contractual Clauses (SCCs).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">3. Subprocessor Notifications &amp; Audits</h3>
            <p>
              We maintain an updated directory of authorized AI subprocessors. Customers may subscribe to subprocessor update notifications or request third-party SOC-2 audit reports by emailing our compliance department.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
