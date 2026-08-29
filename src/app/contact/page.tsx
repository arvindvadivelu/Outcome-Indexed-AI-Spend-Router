"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Mail,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  Globe,
  Bot,
  RotateCcw,
  Calendar,
  MessageSquare,
  Lock,
  Clock,
  Activity
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import Link from "next/link";

export default function ContactPage() {
  const { currency } = useAppStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [spendTier, setSpendTier] = useState("10k-50k");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);

    try {
      // 1. Sync to Google Sheets Audit Ledger
      await fetch("/api/auth/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONTACT_INQUIRY",
          name,
          email,
          workspace: company || "Enterprise Lead",
          plan_tier: "Enterprise Custom",
          monthly_token_quota: spendTier === "100k+" ? 10000000 : 2000000,
          currency: currency || "USD",
          auth_method: `SPEND_TIER_${spendTier.toUpperCase()}`
        })
      });

      // 2. Client bridge dispatch
      await apiClient.sendContactInquiry({
        name,
        email,
        company,
        spend_tier: spendTier,
        message
      });
    } catch (err) {
      console.warn("Contact inquiry sync fallback:", err);
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-16 sm:space-y-24">
        {/* 1. Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-6" suppressHydrationWarning>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
            Talk to an <br />
            <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              AI FinOps Architect.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
            Whether you spend $5K/mo or $100K+/mo on LLMs, our solutions team will audit your prompt traces and calculate exact margin recovery.
          </p>
        </section>

        {/* 2. Contact Form & Advisory Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto" suppressHydrationWarning>
          {/* Left Column: Form / Submitted State */}
          <div className="lg:col-span-7 rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-10 shadow-sm space-y-6">
            {submitted ? (
              <div className="text-center py-10 space-y-6 animate-in fade-in">
                <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">Inquiry Dispatched</h3>
                  <p className="text-xs sm:text-sm text-[#86868B] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{name}</strong>. An AI FinOps Architect has been assigned to <span className="font-semibold text-[#0050FF] dark:text-[#3374FF]">{email}</span> and will respond within 4 hours.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="h-11 px-6 rounded-full bg-[#F5F5F7] dark:bg-[#242428] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 hover:text-[#0050FF] transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Send Another Message</span>
                  </button>
                  <Link
                    href="/docs"
                    className="h-11 px-6 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Explore Docs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h2 className="font-extrabold text-xl text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                    Schedule a Consultation
                  </h2>
                  <p className="text-xs text-[#86868B]">
                    Receive an immediate automated token audit projection.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="Acme AI Lab"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Current Monthly LLM Spend</label>
                    <select
                      value={spendTier}
                      onChange={(e) => setSpendTier(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                    >
                      <option value="under-5k">&lt; $5,000 / month</option>
                      <option value="5k-10k">$5,000 – $10,000 / month</option>
                      <option value="10k-50k">$10,000 – $50,000 / month</option>
                      <option value="50k-100k">$50,000 – $100,000 / month</option>
                      <option value="100k+">$100,000+ / month (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Workload Overview &amp; Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your current model usage (e.g. OpenAI GPT-4o, Claude 3.5 Sonnet, multi-agent pipelines)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 rounded-xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Syncing Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Consultation Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Advisory Direct Benefits */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 shadow-sm space-y-6">
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                What to Expect on the Call
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Prompt Token Bloat Audit</h4>
                    <p className="text-[#86868B] leading-relaxed mt-0.5">We analyze sample payloads to compute exact token savings via semantic delta diffing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Micro-SLA Escrow Setup</h4>
                    <p className="text-[#86868B] leading-relaxed mt-0.5">Define custom latency and quality contracts with zero-loss fallback guarantees.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Dedicated Slack Channel</h4>
                    <p className="text-[#86868B] leading-relaxed mt-0.5">Direct access to core engineering architects for VPC deployment assistance.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-[#86868B]">
                Direct Contact: <a href="mailto:solutions@outcomerouter.ai" className="text-[#0050FF] dark:text-[#3374FF] font-semibold hover:underline">solutions@outcomerouter.ai</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
