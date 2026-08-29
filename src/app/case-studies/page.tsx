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
  FileCheck
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
      modelSymphony: "Claude 3.5 Sonnet (42%) • DeepSeek-V3 (40%) • GPT-4o Mini (18%)",
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
      modelSymphony: "DeepSeek Coder (58%) • Claude 3.5 Sonnet (32%) • Fallback GPT-4o (10%)",
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
      modelSymphony: "Groq Llama 3.3 70B (84%) • GPT-4o Fallback (16%)",
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
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* 1. Spatial Hero Section */}
        <section className="relative overflow-hidden rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-center space-y-6" suppressHydrationWarning>
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-[#0050FF]/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
              <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Enterprise Production Case Studies
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
              Real Teams. Real Outcomes. <br />
              <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                40% to 80% AI Spend Recovered.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              Explore how production engineering teams shifted from single-model brute force to outcome-indexed routing without sacrificing accuracy or SLA compliance.
            </p>

            {/* Filter Pills & Currency Switch */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md">
                {[
                  { id: "all", label: "All Workloads" },
                  { id: "sales", label: "Sales SDR" },
                  { id: "code", label: "Developer Tooling" },
                  { id: "support", label: "Customer Support" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedIndustry(tab.id as any)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-all ${
                      selectedIndustry === tab.id
                        ? "bg-[#0050FF] text-white shadow-xs"
                        : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleCurrency}
                className="h-9 px-4 rounded-full bg-white/80 dark:bg-[#161618]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] transition-all flex items-center gap-1.5 shadow-xs"
                title="Toggle Currency (USD / INR)"
              >
                <Globe className="h-3.5 w-3.5 text-[#0050FF]" />
                <span>Currency: {activeCurrency === "USD" ? "$ USD" : "₹ INR"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Core Production Studies */}
        <section className="space-y-8" suppressHydrationWarning>
          <div className="grid grid-cols-1 gap-8">
            {filteredStudies.map((study, idx) => {
              const beforeSpend = study.spendBefore * rate;
              const afterSpend = study.spendAfter * rate;
              const savedAmount = beforeSpend - afterSpend;

              return (
                <div
                  key={idx}
                  className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-10 shadow-sm space-y-6 hover:border-[#0050FF]/30 transition-all group"
                  suppressHydrationWarning
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-black/[0.05] dark:border-white/[0.08] pb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#0050FF] to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-[#0050FF]/25">
                        {study.logo}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {study.company}
                        </h3>
                        <p className="text-xs text-[#86868B]">{study.industry}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="px-4 py-2 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 border border-[#0050FF]/25">
                        <span className="text-[11px] text-[#86868B] block">Net Savings</span>
                        <span className="font-mono font-extrabold text-sm text-[#0050FF] dark:text-[#3374FF]">
                          +{formatCurrency(savedAmount, activeCurrency)}/mo (-{study.savingsPct}%)
                        </span>
                      </div>
                      <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/25">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">KPI Impact</span>
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          {study.kpiImpact}
                        </span>
                      </div>

                      <button
                        onClick={() => setShowSimulate(true)}
                        className="px-4 py-2 rounded-2xl bg-white dark:bg-[#242428] border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Simulate Model</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[#515154] dark:text-[#A1A1A6] leading-relaxed">
                    {study.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-[#86868B] font-medium">Model Symphony:</span>
                    <span className="font-mono font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {study.modelSymphony}
                    </span>
                  </div>

                  {/* Executive Quote */}
                  <div className="p-5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1A1A1D] border-l-4 border-[#0050FF] text-xs space-y-1">
                    <p className="italic text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
                      &ldquo;{study.quote}&rdquo;
                    </p>
                    <p className="text-[11px] text-[#86868B] font-semibold pt-1">
                      — {study.author}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. CTA Footer Card */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-14 text-white shadow-[0_20px_50px_rgba(0,80,255,0.35)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Achieve the Same Results in Your Stack
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Start optimizing with the 1-line SDK wrapper. Drop in your LangChain, LlamaIndex, or OpenAI endpoint and instantly start saving.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md hover:scale-105 active:scale-95"
              >
                Launch Console Free
              </Link>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20 hover:scale-105 active:scale-95"
              >
                View Plans & Pricing
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
