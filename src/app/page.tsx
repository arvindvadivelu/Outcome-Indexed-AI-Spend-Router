"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  Play,
  Bot,
  Zap,
  TrendingDown,
  CheckCircle2,
  Cpu,
  BrainCircuit,
  Sliders,
  Scale
} from "lucide-react";

export default function HomePage() {
  const { currency } = useAppStore();
  const [monthlySpend, setMonthlySpend] = useState(15000);
  const [activeTab, setActiveTab] = useState<"sales" | "code" | "support">("sales");

  // Dynamic AI Workload Tailor state
  const [customWorkloadInput, setCustomWorkloadInput] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<any>(null);

  const rate = currency === "INR" ? 86.5 : 1;
  const savingsPct = 42;
  const calculatedSavings = monthlySpend * (savingsPct / 100);

  const scenarioData = {
    sales: {
      title: "Outbound Sales SDR",
      targetKpi: "Demo Booking Rate",
      cheapestModel: "Claude 3.5 Sonnet",
      savings: "74% less cost",
      kpiImpact: "+14.2% more booked demos",
      winnerModel: "Claude 3.5 Sonnet",
      baselineModel: "GPT-4o",
      winnerWinRate: "92.4%",
      winnerCost: "$0.0034",
      baselineCost: "$0.0052"
    },
    code: {
      title: "Code Review & PRs",
      targetKpi: "Code Acceptance Rate",
      cheapestModel: "DeepSeek Coder",
      savings: "88% less cost",
      kpiImpact: "94.2% first-pass merge",
      winnerModel: "DeepSeek Coder",
      baselineModel: "GPT-4o",
      winnerWinRate: "92.1%",
      winnerCost: "$0.00065",
      baselineCost: "$0.0062"
    },
    support: {
      title: "Customer Support FAQ",
      targetKpi: "First-Contact Resolution",
      cheapestModel: "Groq Llama 3.3",
      savings: "92% less cost",
      kpiImpact: "84ms P95 latency",
      winnerModel: "Groq Llama 3.3",
      baselineModel: "GPT-4o",
      winnerWinRate: "96.0%",
      winnerCost: "$0.00018",
      baselineCost: "$0.0048"
    }
  };

  const currentScenario = scenarioData[activeTab];

  const handleTailorWorkload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWorkloadInput.trim()) return;

    setIsTailoring(true);
    setTimeout(() => {
      const lower = customWorkloadInput.toLowerCase();
      let winner = "DeepSeek-V3";
      let kpi = "Task Accuracy";
      let cut = "68%";
      let latency = "120ms";

      if (lower.includes("code") || lower.includes("dev") || lower.includes("python") || lower.includes("ts")) {
        winner = "DeepSeek Coder";
        kpi = "PR Merge Rate (93.8%)";
        cut = "82%";
        latency = "115ms";
      } else if (lower.includes("support") || lower.includes("voice") || lower.includes("chat") || lower.includes("help")) {
        winner = "Groq Llama 3.3";
        kpi = "Resolution Rate (96.5%)";
        cut = "91%";
        latency = "84ms";
      } else if (lower.includes("sales") || lower.includes("lead") || lower.includes("copy") || lower.includes("email")) {
        winner = "Claude 3.5 Sonnet";
        kpi = "Reply Rate (+18%)";
        cut = "74%";
        latency = "180ms";
      }

      setTailoredResult({
        workload: customWorkloadInput,
        optimalModel: winner,
        targetKpi: kpi,
        costCut: cut,
        expectedLatency: latency,
        annualSavingsUSD: Math.round(monthlySpend * 0.42 * 12),
        recommendation: `Automated analysis maps '${customWorkloadInput}' to ${winner}, cutting inference spend by ${cut} while exceeding your ${kpi} threshold.`
      });
      setIsTailoring(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 bg-apple-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] text-[#0050FF] text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Outcome-Indexed AI Gateway • 40% Spend Reduction</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1D1D1F] leading-[1.1]">
              Route to the <span className="text-[#0050FF]">Cheapest Model</span> that Delivers Outcomes.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl leading-relaxed">
              Stop paying flagship token prices for everything. We route every AI prompt to the lowest-cost LLM that satisfies your business KPIs.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0050FF] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0043D6] transition-all shadow-md shadow-[#0050FF]/25 hover:scale-[1.02]"
              >
                <span>Start Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-black/[0.08] px-7 py-3 text-sm font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current text-[#0050FF]" />
                <span>Explore Live Console</span>
              </Link>
            </div>

            {/* Live AI Workload Input (Spotlight Style) */}
            <div className="w-full max-w-xl pt-4">
              <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-sm space-y-2.5 text-left">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
                    <Bot className="h-3.5 w-3.5 text-[#0050FF]" />
                    <span>Quick Workload Architect</span>
                  </div>
                  <span className="text-[10px] text-[#86868B]">Instant Analysis</span>
                </div>

                <form onSubmit={handleTailorWorkload} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter use case (e.g. Healthcare triage, Code reviews, SQL generator)"
                    value={customWorkloadInput}
                    onChange={(e) => setCustomWorkloadInput(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-full bg-[#F5F5F7] border border-transparent text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0050FF]/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isTailoring || !customWorkloadInput.trim()}
                    className="px-4 py-1.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm"
                  >
                    {isTailoring ? "Analyzing..." : "Diagnose"}
                  </button>
                </form>

                {tailoredResult && (
                  <div className="p-3 rounded-xl bg-[#EEF4FF] text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[#0050FF] font-semibold">
                      <span>Match: {tailoredResult.optimalModel}</span>
                      <span>-{tailoredResult.costCut} Cost</span>
                    </div>
                    <p className="text-[#515154]">{tailoredResult.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Benchmark Matrix Widget */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-white border border-black/[0.06] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.05] pb-5">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F]">
                  Outcome-Indexed vs. Token-Only Routing
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">Real-world scenario benchmarks</p>
              </div>

              {/* Scenario Tabs */}
              <div className="inline-flex p-1 rounded-full bg-[#F5F5F7]">
                {[
                  { id: "sales", label: "Sales Outreach" },
                  { id: "code", label: "Code Review" },
                  { id: "support", label: "Customer Support" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                      activeTab === tab.id
                        ? "bg-white text-[#1D1D1F] shadow-sm"
                        : "text-[#86868B] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Scenario Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] space-y-1">
                <span className="text-xs text-[#86868B]">Optimal Model Choice</span>
                <p className="text-base font-bold text-[#0050FF]">{currentScenario.winnerModel}</p>
                <p className="text-xs text-emerald-600 font-semibold">{currentScenario.savings}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] space-y-1">
                <span className="text-xs text-[#86868B]">Outcome Win Rate</span>
                <p className="text-base font-bold text-[#1D1D1F]">{currentScenario.winnerWinRate}</p>
                <p className="text-xs text-[#86868B]">Target: {currentScenario.targetKpi}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] space-y-1">
                <span className="text-xs text-[#86868B]">Cost per Request</span>
                <p className="text-base font-bold text-[#1D1D1F] font-mono">{currentScenario.winnerCost}</p>
                <p className="text-xs text-[#86868B]">vs. {currentScenario.baselineCost} (GPT-4o)</p>
              </div>
            </div>
          </div>

          {/* Interactive ROI Slider */}
          <div className="mt-10 max-w-4xl mx-auto rounded-3xl bg-white border border-black/[0.06] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-[#1D1D1F]">Calculate Your Projected Savings</h3>
                <p className="text-xs text-[#86868B]">Adjust your monthly LLM spend to see recovered capital</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#0050FF] font-mono">
                  +{formatCurrency(calculatedSavings * rate, currency)}/mo
                </span>
                <p className="text-xs text-emerald-600 font-medium">Estimated 42% Net Reduction</p>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-2 bg-[#F5F5F7] rounded-lg appearance-none cursor-pointer accent-[#0050FF]"
              />
              <div className="flex justify-between text-xs text-[#86868B] font-mono">
                <span>{formatCurrency(1000 * rate, currency)}/mo</span>
                <span>{formatCurrency(50000 * rate, currency)}/mo</span>
                <span>{formatCurrency(100000 * rate, currency)}/mo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Highlights */}
      <section className="py-16 bg-white border-t border-black/[0.05]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
              Engineered for Production AI Teams
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Drop-in OpenAI SDK compatibility with autonomous FinOps intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BrainCircuit,
                title: "Zero-Shot Classifier",
                desc: "Evaluates token volume and complexity in <2ms to pick the minimum viable model tier."
              },
              {
                icon: Zap,
                title: "Speculative Fast-Track",
                desc: "Races ultra-fast Groq Llama 3.3 (84ms) in parallel with Claude 3.5 Sonnet, cutting P95 latency by 60%."
              },
              {
                icon: Scale,
                title: "Thompson Sampling",
                desc: "Bayesian Beta priors automatically learn model win rates and rebalance traffic in real time."
              },
              {
                icon: Sliders,
                title: "Budget Auto-Pilot",
                desc: "Continuously paces cost and quality weights to guarantee $0 budget overruns every month."
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-[#FBFBFD] border border-black/[0.05] space-y-3">
                  <div className="h-9 w-9 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">{feat.title}</h3>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
