"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Bot,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu,
  Layers,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { currency } = useAppStore();
  const [annualBilling, setAnnualBilling] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const rate = currency === "INR" ? 86.5 : 1;

  // Dynamic AI Plan Recommender state
  const [tokensInput, setTokensInput] = useState(350000);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedPlanResult, setRecommendedPlanResult] = useState<any>(null);

  const handleRecommendPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecommending(true);

    setTimeout(() => {
      let tier = "Starter";
      let price = 29;
      let savings = 140;

      if (tokensInput > 1000000) {
        tier = "Enterprise";
        price = 299;
        savings = 1250;
      } else if (tokensInput > 150000) {
        tier = "Growth";
        price = 99;
        savings = 480;
      } else if (tokensInput <= 10000) {
        tier = "Free";
        price = 0;
        savings = 25;
      }

      setRecommendedPlanResult({
        tier,
        priceUSD: price,
        monthlySavingsUSD: savings,
        rationale: `Based on ~${tokensInput.toLocaleString()} tokens/month, the ${tier} tier maximizes your ROI with multi-model fallback chains, Micro-SLA auto-refund escrow, and Thompson Pareto auto-pilot.`
      });
      setIsRecommending(false);
    }, 450);
  };

  const pricingTiers = [
    {
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
      name: "Growth",
      priceUSD: annualBilling ? 79 : 99,
      period: "per month",
      description: "For scaling engineering teams with heavy multi-turn token volume.",
      tokens: "500,000 tokens / mo",
      features: [
        "500,000 monthly tokens included",
        "Predictive Speculative Pre-Warming (70% TTFT drop)",
        "Micro-SLA Cryptographic Contracts & Auto-Refund Escrow",
        "Semantic Delta Compression (<delta_ref> diffing)",
        "Auto-Pilot Spend Optimizer with Budget Pacing",
        "90-day telemetry retention & CSV audit exports",
        "Priority Slack support & 99.9% Uptime SLA"
      ],
      ctaText: "Start Free Trial",
      ctaHref: "/auth/signup?plan=growth",
      highlighted: true
    },
    {
      name: "Enterprise",
      priceUSD: annualBilling ? 239 : 299,
      period: "per month",
      description: "For high-scale platforms requiring dedicated VPC latency.",
      tokens: "2,000,000 tokens / mo",
      features: [
        "2M+ monthly tokens included (custom overages)",
        "Custom Cross-Tenant Differential Privacy Prior Blend",
        "Private VPC Deployments & Custom LLM Finetune endpoints",
        "SOC2 Type II, HIPAA, and GDPR compliant logs",
        "Custom synthetic judge fine-tuning",
        "Dedicated Solutions Architect & 99.99% Gateway SLA"
      ],
      ctaText: "Contact Enterprise",
      ctaHref: "/contact",
      highlighted: false
    }
  ];

  const faqs = [
    {
      q: "How does OutcomeRouter save 40%+ on LLM spend?",
      a: "Rather than routing every query to expensive frontier models ($0.005/req), OutcomeRouter uses Bayesian Thompson Sampling to classify intent and route to cheaper high-accuracy models (DeepSeek Coder $0.0006, Groq Llama $0.00018) while maintaining equivalent outcome conversion."
    },
    {
      q: "What is the Micro-SLA Auto-Refund Escrow?",
      a: "Every API request generates a cryptographic SHA-256 contract binding latency (<150ms) and quality. If an upstream provider breaches SLA or hallucinates, the request failovers at $0 overage and refunded tokens are logged in your Escrow Ledger."
    },
    {
      q: "Can I use OutcomeRouter as a drop-in OpenAI replacement?",
      a: "Yes! OutcomeRouter exposes standard OpenAI-compatible endpoints (`/v1/chat/completions`). Simply change your `baseURL` to `https://gateway.outcomerouter.ai/v1` in LangChain, LiteLLM, or Vercel AI SDK."
    },
    {
      q: "What currencies are supported?",
      a: "We support USD ($) and INR (₹) with real-time conversion rates and localized GST invoicing."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Outcome-Indexed Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Pay for Successful Outcomes. Not Wasted Tokens.
          </h1>
          <p className="text-sm sm:text-base text-[#86868B]">
            Transparent tiers engineered to guarantee immediate FinOps ROI. Cancel or upgrade anytime.
          </p>

          {/* Billing Toggle (Annual / Monthly) */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-semibold ${!annualBilling ? "text-[#1D1D1F] dark:text-[#F5F5F7]" : "text-[#86868B]"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-full bg-[#0050FF] p-1 flex items-center transition-colors"
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  annualBilling ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${annualBilling ? "text-[#1D1D1F] dark:text-[#F5F5F7]" : "text-[#86868B]"}`}>
                Annual Billing
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic AI Plan Recommender & Token Slider */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
              <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                Interactive Token Calculator & Plan Matcher
              </h3>
            </div>
            <span className="text-xs font-bold font-mono text-[#0050FF] dark:text-[#3374FF]">
              {formatNumber(tokensInput)} Tokens / Month
            </span>
          </div>

          <input
            type="range"
            min="10000"
            max="2500000"
            step="25000"
            value={tokensInput}
            onChange={(e) => setTokensInput(parseInt(e.target.value))}
            className="w-full accent-[#0050FF] h-2 bg-[#F5F5F7] dark:bg-[#1F1F23] rounded-lg cursor-pointer"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-xs text-[#86868B]">
              Slide to your monthly volume to calculate expected net savings vs raw GPT-4o.
            </p>
            <button
              onClick={handleRecommendPlan}
              disabled={isRecommending}
              className="px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/25 flex items-center gap-1.5 shrink-0"
            >
              <Zap className="h-3 w-3 fill-current" />
              <span>{isRecommending ? "Calculating ROI..." : "Calculate Best Plan"}</span>
            </button>
          </div>

          {recommendedPlanResult && (
            <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 space-y-1.5 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">
                  Recommended Tier: {recommendedPlanResult.tier} ({formatCurrency(recommendedPlanResult.priceUSD * rate, currency)}/mo)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Est. Net Savings: +{formatCurrency(recommendedPlanResult.monthlySavingsUSD * rate, currency)}/mo
                </span>
              </div>
              <p className="text-[#515154] dark:text-[#A1A1A6]">{recommendedPlanResult.rationale}</p>
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
                tier.highlighted
                  ? "bg-white dark:bg-[#161618] border-2 border-[#0050FF] shadow-xl relative"
                  : "bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm hover:shadow-md"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0050FF] text-white text-[10px] font-bold tracking-wide uppercase shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-[#1D1D1F] dark:text-[#F5F5F7]">{tier.name}</h3>
                  <p className="text-xs text-[#86868B] mt-1 leading-relaxed">{tier.description}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {formatCurrency(tier.priceUSD * rate, currency)}
                    </span>
                    <span className="text-xs text-[#86868B]">/{tier.period}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0050FF] dark:text-[#3374FF] block mt-1">
                    {tier.tokens}
                  </span>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF] shrink-0 mt-0.5" />
                      <span className="text-[#515154] dark:text-[#A1A1A6]">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={tier.ctaHref}
                className={`w-full py-2.5 rounded-full text-xs font-semibold text-center transition-all shadow-xs ${
                  tier.highlighted
                    ? "bg-[#0050FF] text-white hover:bg-[#0043D6] shadow-[#0050FF]/25"
                    : "bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EEF4FF] dark:hover:bg-[#0050FF]/20 hover:text-[#0050FF]"
                }`}
              >
                {tier.ctaText}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-6 pt-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#86868B]">Everything you need to know about Outcome-Indexed routing and billing</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm cursor-pointer transition-all"
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">{faq.q}</h4>
                  {openFaq === fIdx ? (
                    <ChevronUp className="h-4 w-4 text-[#86868B]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#86868B]" />
                  )}
                </div>
                {openFaq === fIdx && (
                  <p className="text-xs text-[#515154] dark:text-[#A1A1A6] mt-2.5 leading-relaxed animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
