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
  CheckCircle2
} from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20 flex-1 space-y-10 w-full" suppressHydrationWarning>
        <div className="space-y-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>Enterprise Privacy & Zero-Retention Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Privacy Policy & Zero-Data-Retention Commitment
          </h1>
          <p className="text-xs sm:text-sm text-[#86868B]">
            Last updated: August 29, 2026 • SOC 2 Type II Certified • GDPR & DPA Compliant
          </p>
        </div>

        {/* 1. Core Commitments Bento Card */}
        <section className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0050FF]" />
            <span>Core Data Privacy Commitments</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">Zero Disk Retention</span>
              <p className="text-[#86868B] leading-relaxed">
                Prompts and model completions stream purely in-memory through our edge gateway proxy and are destroyed upon connection closure.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Zero AI Training</span>
              <p className="text-[#86868B] leading-relaxed">
                Customer payload data is never used to train, fine-tune, or calibrate public or third-party frontier AI models.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Privacy Policy Details */}
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
