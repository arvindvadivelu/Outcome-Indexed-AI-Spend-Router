"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Shield,
  Lock,
  EyeOff,
  Server,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Mail,
  Scale
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-28 flex-1 space-y-12 w-full" suppressHydrationWarning>
        {/* 1. Header */}
        <section className="space-y-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Enterprise Privacy &amp; Zero-Retention Security</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
            Privacy Policy &amp; Security Standards
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Last updated: August 29, 2026 · SOC 2 Type II Certified · GDPR &amp; DPA Compliant
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/api/compliance/dpa-export?mode=full_package&download=true"
              download="outcome-router-compliance-package.json"
              className="px-5 py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Export Compliance Package (JSON)</span>
            </a>
            <Link
              href="/dpa"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Data Processing Addendum (DPA)</span>
            </Link>
            <Link
              href="/terms"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Scale className="h-3.5 w-3.5 text-[#86868B]" />
              <span>Terms of Service</span>
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail className="h-3.5 w-3.5 text-[#86868B]" />
              <span>Contact Privacy Officer</span>
            </Link>
          </div>
        </section>

        {/* 2. Core Commitments 4-Card Bento Grid */}
        <section className="p-8 sm:p-10 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0050FF]" />
            <span>Four Non-Negotiable Data Privacy Commitments</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">1. Zero Disk Retention</span>
              <p className="text-[#86868B] leading-relaxed">
                Prompts and completions stream in-memory through our edge gateway proxies and are destroyed immediately upon connection closure.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">2. Zero AI Training</span>
              <p className="text-[#86868B] leading-relaxed">
                Customer payload data is never used to train, fine-tune, or evaluate public or third-party frontier AI foundation models.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-purple-600 dark:text-purple-400">3. Cryptographic Nonce Escrow</span>
              <p className="text-[#86868B] leading-relaxed">
                Micro-SLA contracts use one-way SHA-256 hashes of payloads, guaranteeing zero plain-text leaks to external escrow validators.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">4. Differential Privacy Pacing</span>
              <p className="text-[#86868B] leading-relaxed">
                Cross-tenant Thompson sampling priors are blended under mathematical ε=0.5 Differential Privacy Laplacian noise injection.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Detailed Legal Text */}
        <section className="space-y-8 text-xs leading-relaxed text-[#515154] dark:text-[#A1A1A6]">
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">1. Information We Process</h3>
            <p>
              OutcomeRouter operates as a high-concurrency routing reverse-proxy. In order to provide outcome arbitration, telemetry tracking, and Micro-SLA enforcement, our servers temporarily process incoming HTTP request streams containing user prompts and responses.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">2. Zero-Retention Architecture</h3>
            <p>
              We do not persist raw prompt texts or completion contents in permanent database storage. Metadata logged is strictly limited to token counts, latency metrics, cryptographic SHA-256 hashes, and routing decisions for telemetry analytics.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">3. Data Security &amp; Encryption</h3>
            <p>
              All traffic between your application and OutcomeRouter is encrypted in transit using TLS 1.3. Upstream traffic to target foundation model providers (e.g. Anthropic, DeepSeek, Groq, OpenAI) uses dedicated encrypted bridges with customer-managed or gateway-managed API credentials.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">4. Contact Our Privacy Officer</h3>
            <p>
              If you have inquiries regarding our data processing policies, please contact our Data Protection Officer at <a href="mailto:privacy@outcomerouter.ai" className="text-[#0050FF] dark:text-[#3374FF] font-semibold hover:underline">privacy@outcomerouter.ai</a>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
