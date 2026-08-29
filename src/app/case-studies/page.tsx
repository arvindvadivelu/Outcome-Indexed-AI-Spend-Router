"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Globe,
  Play,
  Sliders,
  FileCheck,
  ChevronRight,
  Activity
} from "lucide-react";
import Link from "next/link";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function CaseStudiesPage() {
  const { currency, toggleCurrency } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<"all" | "sales" | "code" | "support">("all");
  const [showSimulate, setShowSimulate] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  const coreStudies = [
    {
      id: "sales",
      company: "LeadScale AI",
      industry: "Sales Automation & SDR Outreach",
      category: "sales",
      logo: "LS",
      spendBefore: 42000,
      spendAfter: 12600,
      savingsPct: 70,
      kpiImpact: "+14.2% Demo Bookings",
      modelSymphony: "Claude 3.5 Sonnet (42%) · DeepSeek-V3 (40%) · Groq (18%)",
      description:
        "LeadScale generates 1.2M cold outreach emails per month. By dynamically classifying prompt intent and routing routine replies to DeepSeek-V3 while keeping high-stakes executive outreach on Claude 3.5 Sonnet, they cut token bills by $29,400/mo while improving reply rates.",
      quote:
        "Outcome-Indexed routing paid for itself on day one. We stopped treating all prompt complexities as equal.",
      author: "Alex Vance, Head of AI Infrastructure"
    },
    {
      id: "code",
      company: "CodeReview.io",
      industry: "Developer Tooling & PR Automation",
      category: "code",
      logo: "CR",
      spendBefore: 68000,
      spendAfter: 29200,
      savingsPct: 57,
      kpiImpact: "94.2% Code Acceptance",
      modelSymphony: "DeepSeek Coder (58%) · Claude 3.5 Sonnet (32%) · Fallback GPT-4o (10%)",
      description:
        "Processing thousands of GitHub pull requests daily. Dynamic routing switches between DeepSeek Coder and Claude 3.5 Sonnet based on syntax complexity, saving $38,800/mo with sub-250ms latency.",
      quote:
        "Our P95 latency dropped from 920ms to 240ms with Speculative Keystroke Pre-Warming enabled.",
      author: "Elena Rostova, VP of Engineering"
    },
    {
      id: "support",
      company: "SupportFlow",
      industry: "Enterprise Helpdesk & Ticketing",
      category: "support",
      logo: "SF",
      spendBefore: 18000,
      spendAfter: 3600,
      savingsPct: 80,
      kpiImpact: "84ms P95 Latency",
      modelSymphony: "Groq Llama 3.3 70B (84%) · GPT-4o Fallback (16%)",
      description:
        "Routing 600K customer support queries per week to Groq Llama 3.3 70B for instant FAQ resolution, with automated fallback to GPT-4o only when confidence dips below 90%.",
      quote:
        "We achieved sub-100ms response times and reduced our support infrastructure cost by 80%.",
      author: "Marcus Chen, Chief Architect"
    }
  ];

  const filteredStudies =
    selectedIndustry === "all"
      ? coreStudies
      : coreStudies.filter((s) => s.category === selectedIndustry);

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24 sm:space-y-32">
        {/* 1. Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto pt-4 sm:pt-6" suppressHydrationWarning>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
            Empirical Results. <br />
            <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Proven FinOps ROI.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
            Real enterprise case studies demonstrating 40% to 80% raw LLM cost reductions with zero quality degradation under Micro-SLA escrow.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/signup"
              className="h-12 px-8 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_8px_24px_rgba(0,80,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setShowSimulate(true)}
              className="h-12 px-8 rounded-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current text-[#0050FF]" />
              <span>Simulate Case Study</span>
            </button>
          </div>
        </section>

        {/* 2. Industry Filter Capsule */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-[#151518]/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] max-w-lg mx-auto shadow-xs">
          {[
            { id: "all", label: "All Case Studies" },
            { id: "sales", label: "Sales SDR" },
            { id: "code", label: "Code Review" },
            { id: "support", label: "Helpdesk" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedIndustry(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedIndustry === tab.id
                  ? "bg-[#0050FF] text-white shadow-xs font-bold"
                  : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. Case Studies Cards Bento Grid */}
        <section className="space-y-8 max-w-4xl mx-auto" suppressHydrationWarning>
          {filteredStudies.map((study) => (
            <div
              key={study.id}
              className="p-8 sm:p-12 rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-8 animate-in fade-in transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] dark:border-white/[0.06] pb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#0050FF] text-white font-extrabold text-base flex items-center justify-center shadow-md">
                    {study.logo}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{study.company}</h2>
                    <p className="text-xs text-[#86868B]">{study.industry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    -{study.savingsPct}% LLM Spend
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]">
                    {study.kpiImpact}
                  </span>
                </div>
              </div>

              {/* Spend Before vs After Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                  <span className="text-[11px] text-[#86868B] uppercase font-mono block">Raw GPT-4o Spend</span>
                  <span className="text-xl font-extrabold font-mono text-red-500">
                    {formatCurrency(study.spendBefore * rate, activeCurrency)} / mo
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-mono block">Routed Spend</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(study.spendAfter * rate, activeCurrency)} / mo
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#0050FF]/[0.04] border border-[#0050FF]/20 space-y-1">
                  <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] uppercase font-mono block">Annual Capital Saved</span>
                  <span className="text-xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
                    +{formatCurrency((study.spendBefore - study.spendAfter) * 12 * rate, activeCurrency)} / yr
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-[#515154] dark:text-[#A1A1A6]">
                <p>{study.description}</p>
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] font-mono text-[11px]">
                  <span className="text-[#86868B] block mb-1 uppercase font-bold">Multi-Model Traffic Allocation:</span>
                  <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">{study.modelSymphony}</span>
                </div>
              </div>

              <blockquote className="p-5 rounded-2xl bg-[#EEF4FF]/70 dark:bg-[#0050FF]/10 border-l-4 border-[#0050FF] text-xs italic text-[#1D1D1F] dark:text-[#F5F5F7] space-y-1">
                <p>&ldquo;{study.quote}&rdquo;</p>
                <footer className="text-[11px] text-[#86868B] font-normal not-italic">— {study.author}</footer>
              </blockquote>
            </div>
          ))}
        </section>

        {/* 4. Enterprise SLA Trust Bar */}
        <section className="p-6 sm:p-8 rounded-[30px] bg-white/60 dark:bg-[#151518]/60 backdrop-blur-2xl border border-black/[0.04] dark:border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-6 text-center" suppressHydrationWarning>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">99.99%</div>
            <div className="text-xs text-[#86868B] font-medium">Gateway Uptime SLA</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">58ms</div>
            <div className="text-xs text-[#86868B] font-medium">Average Edge TTFT</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs text-[#86868B] font-medium">Verifiable SHA-256 Escrow</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">0-Risk</div>
            <div className="text-xs text-[#86868B] font-medium">Auto-Refund Guarantee</div>
          </div>
        </section>

        {/* 5. Apple-Spatial Final Call to Action */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-16 text-white shadow-[0_24px_60px_rgba(0,80,255,0.32)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Reclaim Your AI Margin?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Explore your projected savings in 60 seconds with our free sandbox gateway.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]"
              >
                Read API Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </div>
  );
}
