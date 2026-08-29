"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu,
  Layers,
  Globe,
  Sliders,
  HelpCircle,
  Lock,
  Activity,
  CheckCircle2,
  Minus
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { currency, toggleCurrency } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tokensInput, setTokensInput] = useState<number>(350000);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;

  // Real-time dynamic token recommendation calculation
  const recommendedTier = useMemo(() => {
    if (tokensInput <= 10000) {
      return {
        name: "Free",
        priceUSD: 0,
        monthlySavingsUSD: 35,
        rationale: "Ideal for individual developers evaluating Thompson sampling and initial connector routing."
      };
    } else if (tokensInput <= 100000) {
      return {
        name: "Starter",
        priceUSD: annualBilling ? 23 : 29,
        monthlySavingsUSD: 145,
        rationale: "Perfect for early-stage production workloads with semantic prompt caching and 30-day logs."
      };
    } else if (tokensInput <= 750000) {
      return {
        name: "Growth",
        priceUSD: annualBilling ? 79 : 99,
        monthlySavingsUSD: 520,
        rationale: "Maximizes FinOps ROI with keystroke pre-warming, Micro-SLA auto-refund escrow, and semantic delta diffing."
      };
    } else {
      return {
        name: "Enterprise",
        priceUSD: annualBilling ? 239 : 299,
        monthlySavingsUSD: 1680,
        rationale: "High-volume throughput with custom differential privacy priors, VPC endpoints, and 99.99% gateway SLA."
      };
    }
  }, [tokensInput, annualBilling]);

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      priceUSD: 0,
      period: "forever",
      description: "For individual developers exploring outcome-based routing.",
      tokens: "10,000 tokens / mo",
      features: [
        "10,000 monthly tokens included",
        "Thompson Sampling routing engine",
        "OpenAI + Anthropic + Groq connectors",
        "Basic telemetry logs (3 days)",
        "Community Discord support"
      ],
      ctaText: "Get Started Free",
      ctaHref: "/auth/signup",
      highlighted: false
    },
    {
      id: "starter",
      name: "Starter",
      priceUSD: annualBilling ? 23 : 29,
      period: "per month",
      description: "For early stage teams deploying LLMs to production.",
      tokens: "100,000 tokens / mo",
      features: [
        "100,000 monthly tokens included",
        "pgvector Semantic Prompt Cache",
        "Zero-Shot Complexity Classifier",
        "30-day telemetry retention",
        "Webhook outcome ingestion",
        "Standard email support"
      ],
      ctaText: "Start 14-Day Trial",
      ctaHref: "/auth/signup?plan=starter",
      highlighted: false
    },
    {
      id: "growth",
      name: "Growth",
      priceUSD: annualBilling ? 79 : 99,
      period: "per month",
      description: "For scaling engineering teams with heavy multi-turn token volume.",
      tokens: "500,000 tokens / mo",
      features: [
        "500,000 monthly tokens included",
        "Keystroke Pre-Warming (70% TTFT drop)",
        "Micro-SLA Cryptographic Contracts & Escrow",
        "Semantic Delta Compression (<delta_ref> diffing)",
        "Auto-Pilot Spend Optimizer & Budget Pacing",
        "90-day telemetry retention & CSV audit exports",
        "Priority Slack support & 99.9% Uptime SLA"
      ],
      ctaText: "Start Free Trial",
      ctaHref: "/auth/signup?plan=growth",
      highlighted: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      priceUSD: annualBilling ? 239 : 299,
      period: "per month",
      description: "For high-scale platforms requiring dedicated VPC latency.",
      tokens: "2,000,000 tokens / mo",
      features: [
        "2M+ monthly tokens included (custom overages)",
        "Custom Cross-Tenant Differential Privacy Priors",
        "Private VPC Deployments & Custom LLM endpoints",
        "SOC2 Type II, HIPAA, and GDPR compliant logs",
        "Custom synthetic judge fine-tuning",
        "Dedicated Solutions Architect & 99.99% Gateway SLA"
      ],
      ctaText: "Contact Enterprise",
      ctaHref: "/contact",
      highlighted: false
    }
  ];

  const featureComparisonMatrix = [
    {
      category: "Routing & Intelligence",
      items: [
        { name: "Thompson Sampling Prior Engine", free: true, starter: true, growth: true, enterprise: true },
        { name: "Live Multi-Model Pareto Arbitrage", free: true, starter: true, growth: true, enterprise: true },
        { name: "Keystroke Speculative Pre-Warming", free: false, starter: false, growth: true, enterprise: true },
        { name: "Differential Privacy Prior Blending", free: false, starter: false, growth: false, enterprise: true }
      ]
    },
    {
      category: "FinOps & Cost Optimization",
      items: [
        { name: "Monthly Token Quota", free: "10k", starter: "100k", growth: "500k", enterprise: "2M+" },
        { name: "Semantic Delta Diffing (<delta_ref>)", free: false, starter: false, growth: true, enterprise: true },
        { name: "Cryptographic SHA-256 Micro-SLA Escrow", free: false, starter: false, growth: true, enterprise: true },
        { name: "Auto-Pilot Budget Ceiling Pacing", free: false, starter: true, growth: true, enterprise: true }
      ]
    },
    {
      category: "Telemetry & Compliance",
      items: [
        { name: "Telemetry Log Retention", free: "3 Days", starter: "30 Days", growth: "90 Days", enterprise: "Unlimited" },
        { name: "CSV Audit Export & Webhooks", free: false, starter: true, growth: true, enterprise: true },
        { name: "Dedicated VPC / Custom LLM Endpoints", free: false, starter: false, growth: false, enterprise: true },
        { name: "Guaranteed Gateway SLA", free: "Best-effort", starter: "99.5%", growth: "99.9%", enterprise: "99.99%" }
      ]
    }
  ];

  const faqs = [
    {
      q: "How does OutcomeRouter save 40%+ on LLM spend?",
      a: "Rather than routing every query to expensive frontier models ($0.005/req), OutcomeRouter uses Bayesian Thompson Sampling to classify intent and route to cheaper high-accuracy models (DeepSeek Coder $0.0006, Groq Llama $0.00018) while maintaining equivalent outcome conversion."
    },
    {
      q: "What is the Micro-SLA Auto-Refund Escrow?",
      a: "Every API request generates a cryptographic SHA-256 contract binding latency (<150ms) and quality. If an upstream provider breaches SLA or quality bounds, the request failovers at $0 overage and refunded tokens are logged in your Escrow Ledger."
    },
    {
      q: "Can I use OutcomeRouter as a drop-in replacement for OpenAI?",
      a: "Yes! OutcomeRouter exposes standard OpenAI-compatible endpoints (/v1/chat/completions). Simply change your baseURL to your OutcomeRouter gateway endpoint in LangChain, LiteLLM, or the OpenAI SDK."
    },
    {
      q: "What currencies are supported?",
      a: "We support USD ($) and INR (₹) with real-time conversion rates and localized GST invoicing."
    },
    {
      q: "Can I upgrade or downgrade anytime?",
      a: "Yes. Upgrades take effect immediately with prorated billing. If you hit your monthly token quota, you can upgrade instantly from your console or wait for your automatic 30-day billing reset."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-24 sm:space-y-32">
        {/* 1. Hero Header & Billing Controls */}
        <section className="text-center space-y-8 max-w-3xl mx-auto pt-4 sm:pt-6" suppressHydrationWarning>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08]">
              Pay for Outcomes. <br />
              <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Not Wasted Tokens.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              Transparent plans engineered to deliver immediate FinOps margin recovery. Zero setup fees, instant 1-line integration.
            </p>
          </div>

          {/* Billing Switcher & Currency Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
              <button
                onClick={() => setAnnualBilling(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !annualBilling
                    ? "bg-[#0050FF] text-white shadow-xs font-bold"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnualBilling(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  annualBilling
                    ? "bg-[#0050FF] text-white shadow-xs font-bold"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                  Save 20%
                </span>
              </button>
            </div>

            <button
              onClick={toggleCurrency}
              className="h-10 px-4 rounded-full bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] dark:hover:text-[#3374FF] transition-all flex items-center gap-1.5 shadow-xs"
              title="Toggle Currency (USD / INR)"
            >
              <Globe className="h-3.5 w-3.5 text-[#0050FF]" />
              <span>Currency: {activeCurrency === "USD" ? "$ USD" : "₹ INR"}</span>
            </button>
          </div>
        </section>

        {/* 2. Interactive Token Calculator & Plan Matcher */}
        <section className="p-7 sm:p-9 rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#0050FF]" />
                <h2 className="font-extrabold text-sm sm:text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Interactive Token Volume Matcher
                </h2>
              </div>
              <p className="text-xs text-[#86868B]">
                Slide to your estimated monthly token volume to see your recommended tier and projected savings.
              </p>
            </div>

            <span className="text-sm font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF] bg-[#EEF4FF] dark:bg-[#0050FF]/20 px-3.5 py-1 rounded-full shrink-0">
              {formatNumber(tokensInput)} Tokens / mo
            </span>
          </div>

          <input
            type="range"
            min="10000"
            max="2000000"
            step="10000"
            value={tokensInput}
            onChange={(e) => setTokensInput(parseInt(e.target.value))}
            className="w-full accent-[#0050FF] h-2.5 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg cursor-pointer"
          />

          {/* Dynamic Match Result Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#EEF4FF]/90 via-white/80 to-[#F5F5F7]/90 dark:from-[#0050FF]/15 dark:via-[#161618]/80 dark:to-[#1C1C1E]/80 border border-[#0050FF]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs animate-in fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Recommended:</span>
                <span className="font-extrabold text-[#0050FF] dark:text-[#3374FF] text-sm">
                  {recommendedTier.name} Tier
                </span>
                <span className="text-[#86868B]">
                  ({formatCurrency(recommendedTier.priceUSD * rate, activeCurrency)}/mo)
                </span>
              </div>
              <p className="text-[#515154] dark:text-[#A1A1A6] font-mono leading-relaxed">
                {recommendedTier.rationale}
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <span className="text-[10px] text-[#86868B] uppercase font-mono block">Projected Savings</span>
              <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(recommendedTier.monthlySavingsUSD * rate, activeCurrency)} / mo
              </span>
            </div>
          </div>
        </section>

        {/* 3. Pricing Cards Bento Grid (4 Tiers) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
          {pricingTiers.map((tier) => {
            const isMatched = recommendedTier.name === tier.name;
            return (
              <div
                key={tier.id}
                className={`rounded-[32px] p-7 flex flex-col justify-between space-y-7 transition-all duration-300 relative group ${
                  tier.highlighted
                    ? "bg-white/95 dark:bg-[#151518]/95 backdrop-blur-3xl border-2 border-[#0050FF] shadow-[0_20px_50px_rgba(0,80,255,0.18)] scale-[1.02]"
                    : "bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm hover:shadow-md hover:translate-y-[-2px]"
                }`}
              >
                {/* Popular / Recommended Badge */}
                {tier.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#0050FF] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Most Popular</span>
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="font-extrabold text-xl text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">{tier.name}</h3>
                    <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed font-normal">{tier.description}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                        {formatCurrency(tier.priceUSD * rate, activeCurrency)}
                      </span>
                      <span className="text-xs text-[#86868B]">/{tier.period}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#0050FF] dark:text-[#3374FF] block mt-1.5 font-mono">
                      {tier.tokens}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <Check className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF] shrink-0 mt-0.5" />
                        <span className="text-[#515154] dark:text-[#A1A1A6] leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`w-full py-3.5 rounded-full text-xs font-semibold text-center transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] ${
                    tier.highlighted
                      ? "bg-[#0050FF] text-white hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)]"
                      : "bg-[#F5F5F7] dark:bg-[#242428] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 hover:text-[#0050FF]"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            );
          })}
        </section>

        {/* 4. Interactive Feature Comparison Matrix Toggle */}
        <section className="space-y-6 max-w-5xl mx-auto" suppressHydrationWarning>
          <div className="text-center">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-[#151518]/80 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all shadow-xs"
            >
              <span>{showComparison ? "Hide Detailed Feature Matrix" : "Compare All Features & SLA Capabilities"}</span>
              {showComparison ? <ChevronUp className="h-4 w-4 text-[#0050FF]" /> : <ChevronDown className="h-4 w-4 text-[#0050FF]" />}
            </button>
          </div>

          {showComparison && (
            <div className="rounded-[32px] bg-white/80 dark:bg-[#151518]/80 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-sm overflow-x-auto animate-in fade-in">
              <table className="w-full text-left text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                    <th className="pb-4 font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">Capability</th>
                    <th className="pb-4 font-bold text-center text-[#86868B]">Free</th>
                    <th className="pb-4 font-bold text-center text-[#86868B]">Starter</th>
                    <th className="pb-4 font-bold text-center text-[#0050FF] dark:text-[#3374FF]">Growth</th>
                    <th className="pb-4 font-bold text-center text-[#1D1D1F] dark:text-[#F5F5F7]">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                  {featureComparisonMatrix.map((section, sIdx) => (
                    <div key={sIdx} className="contents">
                      <tr className="bg-black/[0.02] dark:bg-white/[0.02]">
                        <td colSpan={5} className="py-3 px-2 font-extrabold text-[11px] uppercase tracking-wider text-[#86868B]">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((item, iIdx) => (
                        <tr key={iIdx} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                          <td className="py-3 px-2 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">{item.name}</td>
                          <td className="py-3 text-center">
                            {typeof item.free === "boolean" ? (
                              item.free ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <Minus className="h-4 w-4 text-[#86868B] mx-auto opacity-40" />
                            ) : (
                              <span className="font-mono text-[11px] text-[#86868B]">{item.free}</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {typeof item.starter === "boolean" ? (
                              item.starter ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <Minus className="h-4 w-4 text-[#86868B] mx-auto opacity-40" />
                            ) : (
                              <span className="font-mono text-[11px] text-[#86868B]">{item.starter}</span>
                            )}
                          </td>
                          <td className="py-3 text-center bg-[#0050FF]/[0.03] dark:bg-[#0050FF]/[0.06]">
                            {typeof item.growth === "boolean" ? (
                              item.growth ? <Check className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF] mx-auto" /> : <Minus className="h-4 w-4 text-[#86868B] mx-auto opacity-40" />
                            ) : (
                              <span className="font-mono text-[11px] font-bold text-[#0050FF] dark:text-[#3374FF]">{item.growth}</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            {typeof item.enterprise === "boolean" ? (
                              item.enterprise ? <Check className="h-4 w-4 text-emerald-500 mx-auto" /> : <Minus className="h-4 w-4 text-[#86868B] mx-auto opacity-40" />
                            ) : (
                              <span className="font-mono text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </div>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 5. Enterprise Verification & Performance Trust Bar */}
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

        {/* 6. FAQ Accordion */}
        <section className="max-w-3xl mx-auto space-y-8" suppressHydrationWarning>
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Everything you need to know about Outcome-Indexed routing, Micro-SLA escrow, and billing
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="p-5 sm:p-6 rounded-[24px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm cursor-pointer transition-all hover:border-[#0050FF]/30"
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-xs sm:text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">{faq.q}</h3>
                  {openFaq === fIdx ? (
                    <ChevronUp className="h-4 w-4 text-[#0050FF] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#86868B] shrink-0" />
                  )}
                </div>
                {openFaq === fIdx && (
                  <p className="text-xs text-[#515154] dark:text-[#A1A1A6] mt-3 leading-relaxed animate-in fade-in font-normal">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 7. Apple-Spatial Final Call to Action */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-16 text-white shadow-[0_24px_60px_rgba(0,80,255,0.32)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Start Cutting Your LLM Spend Today
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Get started with 10,000 free tokens. Zero credit card required to explore live Thompson routing.
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
    </div>
  );
}
