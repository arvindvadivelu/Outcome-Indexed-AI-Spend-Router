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
  Bot
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ContactPage() {
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

    await apiClient.sendContactInquiry({
      name,
      email,
      company,
      spend_tier: spendTier,
      message
    });
    
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-20 flex-1 space-y-12 w-full" suppressHydrationWarning>
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI FinOps Advisory & Direct Solutions Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
            Talk to an <span className="bg-gradient-to-r from-[#0050FF] to-cyan-500 bg-clip-text text-transparent">AI FinOps Architect</span>
          </h1>
          <p className="text-sm sm:text-base text-[#86868B]">
            Whether you spend $5K/mo or $100K/mo on LLMs, we will evaluate your prompt traces and calculate exact savings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-[#1D1D1F] dark:text-[#F5F5F7]">Request Custom Architecture Audit</h3>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 space-y-2 text-center animate-in fade-in">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-base">Inquiry Dispatched Successfully</h4>
                <p className="text-xs">A dedicated Solutions Architect will reach out to <span className="font-semibold">{email}</span> within 2 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Vance"
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme AI Lab"
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Monthly AI / LLM Spend Range</label>
                  <select
                    value={spendTier}
                    onChange={(e) => setSpendTier(e.target.value)}
                    className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  >
                    <option value="under-5k">&lt; $5,000 / month</option>
                    <option value="5k-25k">$5,000 – $25,000 / month</option>
                    <option value="25k-100k">$25,000 – $100,000 / month</option>
                    <option value="100k+">$100,000+ / month (Custom Enterprise)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#86868B]">Architecture Details / Primary Models Used</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your current LLM stack (e.g. LangChain with GPT-4o, latency requirements, etc.)..."
                    className="w-full p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>{submitting ? "Sending Request..." : "Request Architecture Audit"}</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right Info Cards */}
          <div className="space-y-4">
            <div className="p-6 rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
                <Globe className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Global 24/7 Enterprise Coverage</h4>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Dedicated support engineers stationed across San Francisco, London, and Bengaluru offering 15-minute SLA response for Enterprise tier tenants.
              </p>
            </div>

            <div className="p-6 rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Security & Compliance Direct Access</h4>
              <p className="text-xs text-[#86868B] leading-relaxed">
                Request custom SOC 2 Type II audit packages, execute mutual non-disclosure agreements (NDAs), and configure isolated VPC peering.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
