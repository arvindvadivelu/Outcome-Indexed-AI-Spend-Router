"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Shield,
  Lock,
  EyeOff,
  Server,
  FileCheck,
  Bot,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Download,
  Mail,
  Scale
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 flex-1 space-y-10 w-full" suppressHydrationWarning>
        {/* 1. Spatial Header */}
        <div className="space-y-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Enterprise Privacy & Zero-Retention Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Privacy Policy & Zero-Data-Retention Commitment
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Last updated: August 29, 2026 • SOC 2 Type II Certified • GDPR & DPA Compliant
          </p>

          {/* Quick Compliance Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all shadow-xs flex items-center gap-1.5 hover:scale-105 active:scale-95"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Request SOC-2 Package</span>
            </Link>
            <Link
              href="/dpa"
              className="px-4 py-2 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
            >
              <FileCheck className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Data Processing Addendum (DPA)</span>
            </Link>
            <Link
              href="/terms"
              className="px-4 py-2 rounded-full bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
            >
              <Scale className="h-3.5 w-3.5 text-[#86868B]" />
              <span>Terms of Service</span>
            </Link>
          </div>
        </div>

        {/* 2. Core Commitments 4-Card Bento Grid */}
        <section className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0050FF]" />
            <span>Four Non-Negotiable Data Privacy Commitments</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">1. Zero Disk Retention</span>
              <p className="text-[#86868B] leading-relaxed">
                Prompts and model completions stream purely in-memory through our edge gateway proxy and are destroyed upon connection closure.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">2. Zero AI Training</span>
              <p className="text-[#86868B] leading-relaxed">
                Customer payload data is never used to train, fine-tune, or calibrate public or third-party frontier AI models.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-purple-600 dark:text-purple-400">3. Cryptographic Nonce Escrow</span>
              <p className="text-[#86868B] leading-relaxed">
                Micro-SLA contracts use one-way SHA-256 hashes of payloads, guaranteeing zero plain-text leaks to escrow validators.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">4. Differential Privacy Pacing</span>
              <p className="text-[#86868B] leading-relaxed">
                Cross-tenant Thompson sampling priors are blended under ε=0.5 Differential Privacy noise injection.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Privacy Policy Articles */}
        <section className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6 text-xs text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">1. Information We Collect</h3>
            <p>
              We collect minimal metadata strictly necessary to operate routing services, including your organization name, user account email, hashed API credentials, and aggregated numerical telemetry tokens.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">2. How Telemetry is Processed</h3>
            <p>
              Telemetry metrics (token counts, latency in milliseconds, and outcome success booleans) are pseudonymized and cryptographically signed. You may export or purge your telemetry data at any time via your Console Settings.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">3. Cryptographic Escrow & Audit Logs</h3>
            <p>
              Our Micro-SLA escrow mechanisms generate SHA-256 nonces for each routed request to verify latency thresholds without exposing prompt payloads.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">4. Data Subject Rights & Deletion</h3>
            <p>
              Under GDPR Articles 15–22 and CCPA regulations, you have the right to access, rectify, port, and delete all personal account metadata. Telemetry logs can be purged with zero latency upon account deactivation.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
