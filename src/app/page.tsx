"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Zap,
  TrendingDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Bot,
  Cpu,
  BrainCircuit,
  Sliders
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
      title: "Outbound SDR & Lead Follow-ups",
      targetKpi: "Demo Booking Rate",
      cheapestModel: "DeepSeek-V3 + Claude 3.5 Sonnet",
      savings: "74% less cost",
      kpiImpact: "+14.2% more booked demos",
      prompt: "Draft high-converting personalized email for VP of Engineering",
      winnerModel: "Claude 3.5 Sonnet",
      baselineModel: "GPT-4o",
      winnerWinRate: "92.4%",
      baselineWinRate: "86.0%",
      winnerCost: "$0.0034",
      baselineCost: "$0.0052"
    },
    code: {
      title: "Automated Code Review & PR Checks",
      targetKpi: "Code Acceptance Rate",
      cheapestModel: "DeepSeek Coder + Claude 3.5",
      savings: "88% less cost",
      kpiImpact: "94.2% first-pass PR merge",
      prompt: "Analyze async connection pooling and verify zero memory leaks",
      winnerModel: "DeepSeek Coder",
      baselineModel: "GPT-4o",
      winnerWinRate: "92.1%",
      baselineWinRate: "89.5%",
      winnerCost: "$0.00065",
      baselineCost: "$0.0062"
    },
    support: {
      title: "Tier 1 Customer Support & Triage",
      targetKpi: "First-Contact Resolution",
      cheapestModel: "Groq Llama-3.3 70B",
      savings: "92% less cost",
      kpiImpact: "84ms P95 latency (instant)",
      prompt: "Resolve billing tier upgrade conflict and explain webhook retries",
      winnerModel: "Llama 3.3 70B (Groq)",
      baselineModel: "GPT-4o",
      winnerWinRate: "96.0%",
      baselineWinRate: "95.5%",
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
        winner = "DeepSeek Coder V2 + Claude 3.5 Fallback";
        kpi = "PR Merge Rate (93.8%)";
        cut = "82%";
        latency = "210ms";
      } else if (lower.includes("support") || lower.includes("voice") || lower.includes("realtime") || lower.includes("chat")) {
        winner = "Groq Llama-3.3 70B";
        kpi = "Resolution CSAT (96.5%)";
        cut = "91%";
        latency = "78ms";
      } else if (lower.includes("sales") || lower.includes("lead") || lower.includes("copy")) {
        winner = "Claude 3.5 Sonnet + DeepSeek Chat";
        kpi = "Lead Reply Rate (+18%)";
        cut = "74%";
        latency = "290ms";
      }

      setTailoredResult({
        workload: customWorkloadInput,
        optimalModel: winner,
        targetKpi: kpi,
        costCut: cut,
        expectedLatency: latency,
        annualSavingsUSD: Math.round(monthlySpend * 0.45 * 12),
        recommendation: `Our Zero-Shot AI Classifier automatically maps '${customWorkloadInput}' to ${winner}, cutting inference fees by ${cut} while exceeding your ${kpi} threshold.`
      });
      setIsTailoring(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 bg-apple-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold shadow-apple-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>100% AI-Powered Outcome Router • Cut AI Spend by 40%</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1D1D1F] leading-[1.08]">
              Route to the{" "}
              <span className="text-[#0050FF]">Cheapest Model</span>{" "}
              That Actually Delivers Outcomes.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl leading-relaxed">
              Stop paying GPT-4o token prices for everything. We route every AI prompt to the lowest-cost LLM that satisfies your business KPIs—maximizing conversions, code merges, and customer satisfaction.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0050FF] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#0040CC] transition-all shadow-apple-blue hover:scale-105"
              >
                <span>Start Free (10K Tokens)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white border border-[#E5E5EA] px-7 py-3.5 text-sm font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-apple-sm transition-all"
              >
                <Play className="h-4 w-4 fill-[#0050FF] text-[#0050FF]" />
                <span>Explore Live Console Demo</span>
              </Link>
            </div>

            {/* Live AI Tailor Input */}
            <div className="w-full max-w-2xl pt-6">
              <div className="p-4 rounded-3xl bg-white border border-[#0050FF]/25 shadow-apple-md space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1D1D1F]">
                    <Bot className="h-4 w-4 text-[#0050FF]" />
                    <span>Live AI Workload Architect</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
                    Real-Time Synthesis
                  </span>
                </div>

                <form onSubmit={handleTailorWorkload} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter your AI use case (e.g. Healthcare triage, Automated PR reviews, SQL generator)"
                    value={customWorkloadInput}
                    onChange={(e) => setCustomWorkloadInput(e.target.value)}
                    className="flex-1 h-10 px-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isTailoring || !customWorkloadInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#0050FF] text-white text-xs font-bold hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isTailoring ? "Analyzing..." : "Diagnose AI Architecture"}
                  </button>
                </form>

                {tailoredResult && (
                  <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-2 text-xs font-mono animate-in fade-in">
                    <div className="flex items-center justify-between text-[#0050FF] font-bold">
                      <span>Optimal AI Routing Match: {tailoredResult.optimalModel}</span>
                      <span>-{tailoredResult.costCut} Cost</span>
                    </div>
                    <p className="text-[#515154] font-sans">{tailoredResult.recommendation}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#1D1D1F]">
                      <span>Target KPI: <strong>{tailoredResult.targetKpi}</strong></span>
                      <span>P95 Latency: <strong>{tailoredResult.expectedLatency}</strong></span>
                      <span>Est Annual Savings: <strong>{formatCurrency(tailoredResult.annualSavingsUSD * rate, currency)}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Routing Matrix Widget */}
          <div className="mt-16 max-w-5xl mx-auto rounded-3xl bg-white border border-black/[0.08] p-6 sm:p-10 shadow-apple-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#E5E5EA] pb-6">
              <div>
                <span className="text-xs font-mono text-[#0050FF] font-bold uppercase tracking-wider">
                  Live Outcome Benchmark Matrix
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mt-1">
                  How Outcome-Indexed Routing Beats Token-Only Routers
                </h3>
              </div>

              {/* Scenario Tabs */}
              <div className="flex items-center p-1 rounded-full bg-[#F5F5F7] border border-[#E5E5EA]">
                <button
                  onClick={() => setActiveTab("sales")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTab === "sales"
                      ? "bg-[#0050FF] text-white shadow-sm"
                      : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  }`}
                >
                  Sales Outreach
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTab === "code"
                      ? "bg-[#0050FF] text-white shadow-sm"
                      : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  }`}
                >
                  Code Generation
                </button>
                <button
                  onClick={() => setActiveTab("support")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTab === "support"
                      ? "bg-[#0050FF] text-white shadow-sm"
                      : "text-[#6E6E73] hover:text-[#1D1D1F]"
                  }`}
                >
                  Support Triage
                </button>
              </div>
            </div>

            {/* Scenario Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 items-center">
              {/* Left: Decision Logic */}
              <div className="space-y-4 lg:col-span-1">
                <div className="p-5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#86868B]">Target Business KPI</span>
                    <span className="font-mono text-[#0050FF] font-bold">{currentScenario.targetKpi}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#86868B]">Optimal Router Choice</span>
                    <span className="font-mono text-[#1D1D1F] font-bold">{currentScenario.winnerModel}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#86868B]">Cost Reduction</span>
                    <span className="font-mono text-[#0050FF] font-bold">{currentScenario.savings}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#86868B]">KPI Improvement</span>
                    <span className="font-mono text-[#0050FF] font-bold">{currentScenario.kpiImpact}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-[#0050FF]/20 text-xs text-[#0050FF] font-medium leading-relaxed">
                  <span className="font-bold">Why not GPT-4o?</span> Claude 3.5 Sonnet and DeepSeek achieved higher reply rates while saving 74% on token fees.
                </div>
              </div>

              {/* Center/Right: Head-to-Head */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Traditional Model Card */}
                <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#86868B]">Naïve Default</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#515154] border border-[#E5E5EA]">
                      Standard Practice
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1D1D1F]">{currentScenario.baselineModel} for Everything</h4>
                    <p className="text-xs text-[#86868B] mt-1">High cost per token, zero outcome feedback loop</p>
                  </div>
                  <div className="pt-2 border-t border-[#E5E5EA] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#86868B]">Cost / Req:</span>
                      <span className="text-red-500 font-bold">{currentScenario.baselineCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868B]">Win Rate:</span>
                      <span className="text-[#1D1D1F]">{currentScenario.baselineWinRate}</span>
                    </div>
                  </div>
                </div>

                {/* Outcome Router Card */}
                <div className="p-6 rounded-2xl bg-white border-2 border-[#0050FF] space-y-4 relative shadow-apple-md">
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#0050FF] text-white text-[10px] font-mono font-bold uppercase">
                    Outcome-Optimized
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0050FF]">Outcome Router</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold">
                      Multi-Model
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#1D1D1F]">{currentScenario.winnerModel}</h4>
                    <p className="text-xs text-[#86868B] mt-1">Dynamic Thompson sampling tuned to {currentScenario.targetKpi}</p>
                  </div>
                  <div className="pt-2 border-t border-[#E5E5EA] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#86868B]">Cost / Req:</span>
                      <span className="text-[#0050FF] font-bold">{currentScenario.winnerCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868B]">Win Rate:</span>
                      <span className="text-[#0050FF] font-bold">{currentScenario.winnerWinRate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ROI Savings Calculator */}
      <section className="py-24 bg-[#F5F5F7] border-t border-black/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F]">
              Calculate Your Organization’s Cost Savings
            </h2>
            <p className="text-[#6E6E73] text-sm sm:text-base">
              Move the slider to match your current monthly LLM API invoice. See what you retain using Outcome Router.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-apple-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Slider */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-mono uppercase text-[#86868B] font-bold block mb-2">
                  Current Monthly AI API Spend:
                </label>
                <div className="text-4xl font-extrabold font-mono text-[#1D1D1F]">
                  {formatCurrency(monthlySpend * rate, currency)}/mo
                </div>
              </div>

              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-2.5 bg-[#E5E5EA] rounded-full appearance-none cursor-pointer accent-[#0050FF]"
              />

              <div className="flex justify-between text-xs font-mono text-[#86868B]">
                <span>{formatCurrency(1000 * rate, currency)}</span>
                <span>{formatCurrency(50000 * rate, currency)}</span>
                <span>{formatCurrency(100000 * rate, currency)}+</span>
              </div>
            </div>

            {/* Output Card */}
            <div className="p-7 rounded-2xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-4">
              <span className="text-xs font-mono uppercase text-[#0050FF] font-bold tracking-wider">
                Estimated Net Savings (42% Avg)
              </span>
              <div className="text-4xl font-extrabold font-mono text-[#0050FF]">
                {formatCurrency(calculatedSavings * rate, currency)}
                <span className="text-sm font-normal text-[#6E6E73]"> / month</span>
              </div>
              <p className="text-xs text-[#515154] leading-relaxed">
                That equals{" "}
                <span className="font-bold text-[#1D1D1F] font-mono">
                  {formatCurrency(calculatedSavings * 12 * rate, currency)}
                </span>{" "}
                retained annually in engineering margin without lowering output quality.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center w-full py-3 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] transition-colors shadow-apple-blue"
              >
                Claim Your Savings Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
