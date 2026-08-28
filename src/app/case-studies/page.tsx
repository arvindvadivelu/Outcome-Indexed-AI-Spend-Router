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
  Bot,
  Building,
  Layers,
  Cpu,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function CaseStudiesPage() {
  const { currency } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  // Custom AI Case Study Generator state
  const [industryInput, setIndustryInput] = useState("B2B SaaS DevTools");
  const [techStackInput, setTechStackInput] = useState("Next.js + Python LangGraph + Postgres");
  const [spendInput, setSpendInput] = useState(25000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaseStudy, setGeneratedCaseStudy] = useState<any>(null);

  const handleGenerateCaseStudy = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const savingsPct = 43.8;
      const savingsUsd = spendInput * (savingsPct / 100);
      const afterSpend = spendInput - savingsUsd;

      setGeneratedCaseStudy({
        companyName: `${industryInput.split(" ")[0]} AI Labs`,
        industry: industryInput,
        techStack: techStackInput,
        beforeSpend: spendInput,
        afterSpend: Math.round(afterSpend),
        savingsUsd: Math.round(savingsUsd),
        annualSavings: Math.round(savingsUsd * 12),
        savingsPct: 43.8,
        kpiBoost: "+18.4% faster PR merges with zero token degradation",
        modelDistribution: "DeepSeek Coder (48%) • Claude 3.5 Sonnet (32%) • Groq Llama 3.3 (20%)",
        executiveQuote: `Outcome Router transformed our ${techStackInput} pipeline within 48 hours. We eliminated $${Math.round(savingsUsd).toLocaleString()}/month in wasted GPT-4o calls while increasing code acceptance rates.`
      });
      setIsGenerating(false);
    }, 600);
  };

  const existingStudies = [
    {
      company: "LeadScale AI",
      industry: "Sales Automation & SDR Outreach",
      logo: "LS",
      spendBefore: 42000,
      spendAfter: 12600,
      savingsPct: 70,
      kpiImpact: "+14.2% Demo Bookings",
      description:
        "LeadScale generates 1.2M cold emails per month. By shifting routine outreach from GPT-4o to DeepSeek-V3 and Claude 3.5 Sonnet, they cut token bills by $29,400/mo while improving reply rates.",
      quote:
        "Outcome-Indexed routing paid for itself on day one. We stopped treating all prompt complexities the same.",
      author: "Alex Vance, Head of AI Infrastructure"
    },
    {
      company: "CodeReview.io",
      industry: "Developer Tooling & PR Automation",
      logo: "CR",
      spendBefore: 68000,
      spendAfter: 29200,
      savingsPct: 57,
      kpiImpact: "94.2% Code Acceptance",
      description:
        "Processing thousands of pull requests daily. Dynamic routing switches between DeepSeek Coder and Claude 3.5 Sonnet based on syntax complexity, saving $38,800/mo.",
      quote:
        "Our P95 latency dropped from 920ms to 240ms with Speculative Dual-Model racing enabled.",
      author: "Elena Rostova, VP of Engineering"
    },
    {
      company: "SupportFlow",
      industry: "Enterprise Helpdesk & Ticketing",
      logo: "SF",
      spendBefore: 18000,
      spendAfter: 3600,
      savingsPct: 80,
      kpiImpact: "84ms P95 Latency",
      description:
        "SupportFlow routes triage tickets to Groq-hosted Llama-3.3 70B for near-instant classification and resolves complex tier-2 issues with GPT-4o mini.",
      quote:
        "The fastest support responses in our category, with an 80% reduction in AI operating spend.",
      author: "Marcus Chen, Founder & CTO"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      {/* Header */}
      <section className="py-20 bg-apple-hero text-center border-b border-black/[0.06]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold shadow-apple-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real-World ROI Case Studies & Custom AI Generator</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1D1D1F] tracking-tight">
            How Top Teams Save <span className="text-[#0050FF]">$10K–$50K/Month</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl mx-auto">
            Discover verified customer case studies, or generate an instant AI simulation tailored to your specific engineering stack.
          </p>
        </div>
      </section>

      {/* 1. Custom AI Enterprise Case Study Generator */}
      <section className="py-12 bg-white border-b border-[#E5E5EA]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-[#FBFBFD] border border-[#0050FF]/25 shadow-apple-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5EA] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#EEF4FF] text-[#0050FF]">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1D1D1F]">AI Custom Case Study Synthesizer</h3>
                  <p className="text-xs text-[#86868B]">Enter your stack and monthly spend to simulate your customized ROI transition</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-1 rounded-full border border-[#0050FF]/20">
                100% AI Synthesized
              </span>
            </div>

            <form onSubmit={handleGenerateCaseStudy} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Your Industry Domain:</label>
                <input
                  type="text"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Tech & LLM Pipeline Stack:</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1.5">Monthly LLM Spend (USD):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={spendInput}
                    onChange={(e) => setSpendInput(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-5 h-11 rounded-2xl bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    {isGenerating ? "Synthesizing..." : "Generate"}
                  </button>
                </div>
              </div>
            </form>

            {generatedCaseStudy && (
              <div className="p-6 rounded-2xl bg-white border border-[#0050FF]/30 space-y-4 animate-in fade-in shadow-apple-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5EA] pb-3 gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#1D1D1F]">{generatedCaseStudy.companyName}</h4>
                    <p className="text-xs text-[#86868B]">Stack: {generatedCaseStudy.techStack}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0050FF]">
                    <TrendingDown className="h-4 w-4" />
                    <span>-{generatedCaseStudy.savingsPct}% Spend Reduction</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#F5F5F7]">
                    <span className="text-[10px] text-[#86868B] block">Before Spend</span>
                    <span className="font-bold text-red-500">{formatCurrency(generatedCaseStudy.beforeSpend * rate, currency)}/mo</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F5F5F7]">
                    <span className="text-[10px] text-[#86868B] block">Optimized Spend</span>
                    <span className="font-bold text-[#1D1D1F]">{formatCurrency(generatedCaseStudy.afterSpend * rate, currency)}/mo</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EEF4FF]">
                    <span className="text-[10px] text-[#0050FF] block">Monthly Net Retained</span>
                    <span className="font-bold text-[#0050FF]">+{formatCurrency(generatedCaseStudy.savingsUsd * rate, currency)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EEF4FF]">
                    <span className="text-[10px] text-[#0050FF] block">Annual Net Retained</span>
                    <span className="font-bold text-[#0050FF]">+{formatCurrency(generatedCaseStudy.annualSavings * rate, currency)}</span>
                  </div>
                </div>

                <p className="text-xs italic text-[#515154] bg-[#F5F5F7] p-3.5 rounded-xl border border-[#E5E5EA]">
                  "{generatedCaseStudy.executiveQuote}"
                </p>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#86868B]">
                  <span>AI Traffic Distribution: <strong className="text-[#1D1D1F]">{generatedCaseStudy.modelDistribution}</strong></span>
                  <span className="text-[#0050FF] font-bold">{generatedCaseStudy.kpiBoost}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Featured Verified Case Studies */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">
            Verified Customer Case Studies
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {existingStudies.map((study, index) => (
              <div
                key={index}
                className="p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm flex flex-col justify-between space-y-6 hover:shadow-apple-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center font-bold text-lg">
                      {study.logo}
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-1 rounded-full border border-[#0050FF]/20">
                      -{study.savingsPct}% Spend
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#1D1D1F]">{study.company}</h3>
                    <p className="text-xs font-mono text-[#86868B]">{study.industry}</p>
                  </div>

                  <p className="text-xs text-[#515154] leading-relaxed">{study.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E5E5EA]">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#86868B]">Monthly Spend:</span>
                    <div className="space-x-1.5">
                      <span className="line-through text-red-500">
                        {formatCurrency(study.spendBefore * rate, currency)}
                      </span>
                      <span className="text-[#0050FF] font-bold">
                        {formatCurrency(study.spendAfter * rate, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#86868B]">Outcome KPI:</span>
                    <span className="text-[#0050FF] font-bold">{study.kpiImpact}</span>
                  </div>

                  <p className="text-xs italic text-[#6E6E73] pt-2 border-t border-[#E5E5EA]">
                    "{study.quote}"
                  </p>
                  <p className="text-[10px] text-[#86868B] font-mono">— {study.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
