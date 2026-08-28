"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Bot
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { currency } = useAppStore();
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
        tier = "Business";
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
        rationale: `Based on ~${tokensInput.toLocaleString()} tokens/month, the ${tier} tier maximizes your ROI with multi-model fallback chains and Thompson Pareto auto-pilot.`
      });
      setIsRecommending(false);
    }, 450);
  };

  const pricingTiers = [
    {
      name: "Free",
      priceUSD: 0,
      period: "forever",
      description: "For individual developers exploring outcome routing.",
      tokens: "10,000 tokens / mo",
      features: [
        "10,000 monthly tokens included",
        "Thompson Sampling routing engine",
        "OpenAI + Anthropic + Groq connectors",
        "Basic telemetry logs (3 days)",
        "Community support"
      ],
      ctaText: "Get Started",
      ctaHref: "/auth/signup",
      highlighted: false
    },
    {
      name: "Starter",
      priceUSD: 29,
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
      priceUSD: 99,
      period: "per month",
      description: "For scaling products with serious token volume.",
      tokens: "500,000 tokens / mo",
      features: [
        "500,000 monthly tokens included",
        "Autonomous Budget Auto-Pilot",
        "Speculative Dual-Model Execution",
        "Self-Correction Critic Telemetry",
        "90-day retention & RBAC controls",
        "Priority Slack support"
      ],
      ctaText: "Start 14-Day Trial",
      ctaHref: "/auth/signup?plan=growth",
      highlighted: true
    },
    {
      name: "Business",
      priceUSD: 299,
      period: "per month",
      description: "For engineering orgs requiring dedicated SLAs and VPCs.",
      tokens: "2,000,000 tokens / mo",
      features: [
        "2,000,000 monthly tokens included",
        "Custom SLM Embeddings Classifier",
        "Self-Hosted On-Prem / VPC Deploy",
        "Synthetic Prior Bootstrapper",
        "99.99% Enterprise Uptime SLA",
        "Dedicated FinOps Solutions Architect"
      ],
      ctaText: "Contact Sales",
      ctaHref: "/contact",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              Simple, Transparent Pricing
            </h1>
            <p className="text-base text-[#6E6E73]">
              Every tier pays for itself through autonomous 40% LLM spend reductions.
            </p>
          </div>

          {/* AI Plan Recommender Box */}
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1D1D1F]">
              <div className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-[#0050FF]" />
                <span>AI Plan Advisor</span>
              </div>
              <span className="text-[10px] text-[#86868B]">Instant Recommendation</span>
            </div>

            <form onSubmit={handleRecommendPlan} className="flex gap-2">
              <input
                type="number"
                placeholder="Monthly token volume (e.g. 500000)"
                value={tokensInput}
                onChange={(e) => setTokensInput(Number(e.target.value))}
                className="flex-1 h-9 px-3 rounded-full bg-[#F5F5F7] border border-transparent text-xs text-[#1D1D1F] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={isRecommending || tokensInput <= 0}
                className="px-4 py-1.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm"
              >
                {isRecommending ? "Calculating..." : "Find Best Plan"}
              </button>
            </form>

            {recommendedPlanResult && (
              <div className="p-3 rounded-xl bg-[#EEF4FF] text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between text-[#0050FF] font-semibold">
                  <span>Recommended: {recommendedPlanResult.tier} Tier</span>
                  <span>Est Savings: +{formatCurrency(recommendedPlanResult.monthlySavingsUSD * rate, currency)}/mo</span>
                </div>
                <p className="text-[#515154]">{recommendedPlanResult.rationale}</p>
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all ${
                  tier.highlighted
                    ? "bg-white border-2 border-[#0050FF] shadow-lg relative"
                    : "bg-white border border-black/[0.06] shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0050FF] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#1D1D1F]">{tier.name}</h3>
                    <p className="text-xs text-[#86868B] mt-1">{tier.description}</p>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono text-[#1D1D1F]">
                        {formatCurrency(tier.priceUSD * rate, currency)}
                      </span>
                      <span className="text-xs text-[#86868B]">/{tier.period}</span>
                    </div>
                    <p className="text-xs text-[#0050FF] font-medium mt-1">{tier.tokens}</p>
                  </div>

                  <div className="pt-4 border-t border-[#F5F5F7] space-y-2.5">
                    {tier.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-[#515154]">
                        <Check className="h-3.5 w-3.5 text-[#0050FF] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`w-full py-2.5 rounded-full text-xs font-semibold text-center transition-all ${
                    tier.highlighted
                      ? "bg-[#0050FF] text-white hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25"
                      : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EBEBEF]"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
