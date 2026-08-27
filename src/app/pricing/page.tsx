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
  HelpCircle,
  Bot,
  Gauge,
  Cpu
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const { currency } = useAppStore();
  const rate = currency === "INR" ? 86.5 : 1;

  // Dynamic AI Plan Recommender state
  const [tokensInput, setTokensInput] = useState(350000);
  const [teamMembersInput, setTeamMembersInput] = useState(6);
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
        roiMultiplier: "4.8x",
        rationale: `With ${tokensInput.toLocaleString()} tokens/month across ${teamMembersInput} developers, the ${tier} tier maximizes your ROI with multi-model fallback chains and Thompson Pareto auto-pilot.`
      });
      setIsRecommending(false);
    }, 500);
  };

  const pricingTiers = [
    {
      name: "Free",
      badge: "Sandbox",
      priceUSD: 0,
      priceINR: 0,
      period: "forever",
      description: "For individual developers testing outcome-indexed routing.",
      tokens: "10,000 free tokens / mo",
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
      badge: "Early Stage",
      priceUSD: 29,
      priceINR: 29 * 86.5,
      period: "per month",
      description: "For small SaaS startups launching AI features into production.",
      tokens: "100,000 tokens / mo ($0.0003/token overage)",
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
      badge: "Most Popular",
      priceUSD: 99,
      priceINR: 99 * 86.5,
      period: "per month",
      description: "For high-growth scaleups spending $5K–$25K/mo on LLM APIs.",
      tokens: "500,000 tokens / mo ($0.0002/token overage)",
      features: [
        "500,000 monthly tokens included",
        "Speculative Dual-Model Execution",
        "Self-Correction Fallback Critic",
        "Natural Language Policy Synthesizer",
        "Autonomous Budget Auto-Pilot",
        "Live A/B Model Benchmarking Matrix",
        "Slack spend anomaly alerts",
        "Priority 4-hour SLA support"
      ],
      ctaText: "Start 14-Day Trial",
      ctaHref: "/auth/signup?plan=growth",
      highlighted: true
    },
    {
      name: "Business",
      badge: "Scaling AI Teams",
      priceUSD: 299,
      priceINR: 299 * 86.5,
      period: "per month",
      description: "For engineering teams needing strict SLA latencies and team quotas.",
      tokens: "2,000,000 tokens / mo ($0.00015/token overage)",
      features: [
        "2,000,000 monthly tokens included",
        "Unlimited custom routing rules",
        "Dedicated rate limits (2,500 RPM)",
        "Role-based access control (RBAC)",
        "Audit logs & SOC 2 compliance pack",
        "1-hour dedicated SLA support",
        "Quarterly AI spend audits"
      ],
      ctaText: "Upgrade to Business",
      ctaHref: "/auth/signup?plan=business",
      highlighted: false
    },
    {
      name: "Enterprise",
      badge: "Custom VPC",
      priceUSD: "Custom",
      priceINR: "Custom",
      period: "annual billing",
      description: "For Fortune 500 & AI agencies with custom VPC and zero-retention mandates.",
      tokens: "Custom volume with volume discounting",
      features: [
        "Custom token volume allowances",
        "Self-hosted VPC / on-premise deployment",
        "Custom LLM fine-tuned model hosting",
        "Zero data retention guarantee",
        "Custom MSA, BAA, & SLA terms",
        "Dedicated AI FinOps Solutions Architect"
      ],
      ctaText: "Contact Sales",
      ctaHref: "/contact",
      highlighted: false
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
            <span>Transparent Outcome-Based Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1D1D1F] tracking-tight">
            Plans That <span className="text-[#0050FF]">Pay for Themselves</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl mx-auto">
            Choose the plan that matches your monthly volume. Average customer ROI is 4.2x plan cost.
          </p>
        </div>
      </section>

      {/* 1. AI Plan Recommender & Token Budget Architect */}
      <section className="py-10 bg-white border-b border-[#E5E5EA]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFBFD] border border-[#0050FF]/25 shadow-apple-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">AI Plan Recommender & Budget Architect</h3>
                  <p className="text-[11px] text-[#86868B]">Enter your token metrics to have AI compute your optimal plan</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
                AI Sizing Engine
              </span>
            </div>

            <form onSubmit={handleRecommendPlan} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1">Estimated Monthly Tokens:</label>
                <input
                  type="number"
                  value={tokensInput}
                  onChange={(e) => setTokensInput(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1D1D1F] block mb-1">Engineers / Team Seats:</label>
                <input
                  type="number"
                  value={teamMembersInput}
                  onChange={(e) => setTeamMembersInput(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isRecommending}
                  className="w-full h-10 rounded-xl bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isRecommending ? "Calculating..." : "Compute Optimal Plan"}
                </button>
              </div>
            </form>

            {recommendedPlanResult && (
              <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-2 text-xs font-mono animate-in fade-in">
                <div className="flex items-center justify-between text-[#0050FF] font-bold">
                  <span>Recommended Tier: {recommendedPlanResult.tier}</span>
                  <span>Projected Savings: +{formatCurrency(recommendedPlanResult.monthlySavingsUSD * rate, currency)}/mo</span>
                </div>
                <p className="text-[#515154] font-sans">{recommendedPlanResult.rationale}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Pricing Cards Grid */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {pricingTiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all bg-white ${
                  tier.highlighted
                    ? "border-2 border-[#0050FF] shadow-apple-lg relative scale-105 z-10"
                    : "border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1D1D1F] uppercase font-mono">{tier.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        tier.highlighted
                          ? "bg-[#0050FF] text-white"
                          : "bg-[#F5F5F7] text-[#515154] border border-[#E5E5EA]"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-3xl font-extrabold text-[#1D1D1F] font-mono">
                      {typeof tier.priceUSD === "number"
                        ? formatCurrency(tier.priceUSD * rate, currency)
                        : tier.priceUSD}
                    </div>
                    <span className="text-[11px] text-[#86868B]">{tier.period}</span>
                  </div>

                  <p className="text-xs text-[#6E6E73] leading-relaxed">{tier.description}</p>

                  <div className="pt-3 border-t border-[#E5E5EA] space-y-2">
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#515154]">
                        <Check className="h-3.5 w-3.5 text-[#0050FF] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E5E5EA]">
                  <Link
                    href={tier.ctaHref}
                    className={`w-full py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                      tier.highlighted
                        ? "bg-[#0050FF] text-white hover:bg-[#0040CC] shadow-apple-blue"
                        : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EBEBEF] border border-[#E5E5EA]"
                    }`}
                  >
                    {tier.ctaText}
                  </Link>
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
