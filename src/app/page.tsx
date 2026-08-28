"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
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
  Scale,
  ShieldCheck,
  Layers,
  Globe
} from "lucide-react";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function HomePage() {
  const { currency } = useAppStore();
  const [monthlySpend, setMonthlySpend] = useState(15000);
  const [activeTab, setActiveTab] = useState<"sales" | "code" | "support">("sales");
  const [showSimulate, setShowSimulate] = useState(false);

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
        kpi = "Reply & Conversion Rate (92.4%)";
        cut = "74%";
        latency = "140ms";
      }

      setTailoredResult({
        optimalModel: winner,
        targetMetric: kpi,
        estimatedSpendCut: cut,
        latencySla: latency,
        rationale: `Classified as ${kpi}. Routing via ${winner} achieves maximum Pareto outcome conversion at ${latency} P95 latency.`
      });
      setIsTailoring(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-24">
        {/* 1. Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Outcome-Indexed AI Spend Router</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
            Stop Paying for “Best Models”. <br />
            <span className="text-[#0050FF] dark:text-[#3374FF]">Pay for Successful Outcomes.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
            The intelligent gateway that routes every prompt dynamically to the cheapest viable model (DeepSeek, Claude 3.5, Groq) based on conversion KPIs—cutting LLM spend by 40%+ with cryptographic Micro-SLA guarantees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/app/dashboard"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25 flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setShowSimulate(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.12] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold hover:bg-[#F5F5F7] dark:hover:bg-[#1F1F23] flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Simulate Request</span>
            </button>
          </div>
        </section>

        {/* 2. 4 Breakthrough Strategic Features Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
            <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">Speculative Pre-Warming</h4>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              Cuts TTFT by 75.6% (68.4ms) via streaming keystroke intent detection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
            <div className="h-8 w-8 rounded-xl bg-[#E6F4EA] dark:bg-[#1E3A2F] text-[#137333] dark:text-[#81C995] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">Micro-SLA Auto-Refund</h4>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              SHA-256 contracts with zero-loss fallback & automatic vendor escrow refund logging.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
            <div className="h-8 w-8 rounded-xl bg-[#F5F5F7] dark:bg-[#1F1F23] text-[#515154] dark:text-[#A1A1A6] flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">Semantic Delta Diffing</h4>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              Replaces multi-turn prompt bloat with &lt;delta_ref&gt; tags, saving 60.3% tokens.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-2">
            <div className="h-8 w-8 rounded-xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
            <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7]">Federated Thompson Priors</h4>
            <p className="text-[11px] text-[#86868B] leading-relaxed">
              Consensus priors across 480+ SaaS workloads with ε=0.5 Differential Privacy.
            </p>
          </div>
        </section>

        {/* 3. Interactive ROI & Spend Savings Calculator */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Calculate Your Organization's AI Spend ROI
            </h2>
            <p className="text-xs text-[#86868B]">
              See how much your team saves by shifting from single-model brute force to outcome routing.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#86868B]">Monthly LLM Spend (Raw GPT-4o / Claude)</span>
              <span className="text-lg font-bold font-mono text-[#0050FF] dark:text-[#3374FF]">
                {formatCurrency(monthlySpend * rate, currency)} / mo
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(parseInt(e.target.value))}
              className="w-full accent-[#0050FF] h-2 bg-[#F5F5F7] dark:bg-[#1F1F23] rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 space-y-1">
                <span className="text-xs text-[#0050FF] dark:text-[#3374FF] font-semibold">Estimated Net Savings</span>
                <div className="text-3xl font-bold font-mono text-[#0050FF] dark:text-[#3374FF]">
                  +{formatCurrency(calculatedSavings * rate, currency)} / mo
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">42.0% immediate margin recovery</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                <span className="text-xs text-[#86868B] font-semibold">Annual Capital Saved</span>
                <div className="text-3xl font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                  +{formatCurrency(calculatedSavings * 12 * rate, currency)} / yr
                </div>
                <p className="text-[11px] text-[#86868B]">Guaranteed under Micro-SLA escrow</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Dynamic Workload Tailor Form */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.05] dark:border-white/[0.08] shadow-sm space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#0050FF] dark:text-[#3374FF]" />
            <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
              Dynamic AI Workload Tailor & Policy Matcher
            </h3>
          </div>
          <p className="text-xs text-[#86868B]">
            Describe your application or prompt payload in plain English to see which Pareto model wins.
          </p>

          <form onSubmit={handleTailorWorkload} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Multi-turn Python code generation with Next.js edge streaming"
              value={customWorkloadInput}
              onChange={(e) => setCustomWorkloadInput(e.target.value)}
              className="flex-1 h-10 px-4 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isTailoring || !customWorkloadInput.trim()}
              className="px-5 h-10 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] disabled:opacity-40 transition-all shadow-sm shadow-[#0050FF]/25 flex items-center gap-1.5 shrink-0"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{isTailoring ? "Evaluating..." : "Evaluate Policy"}</span>
            </button>
          </form>

          {tailoredResult && (
            <div className="p-4 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/15 border border-[#0050FF]/20 space-y-2 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">
                  Optimal Model: {tailoredResult.optimalModel} ({tailoredResult.latencySla})
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Spend Cut: -{tailoredResult.estimatedSpendCut}
                </span>
              </div>
              <p className="text-[#515154] dark:text-[#A1A1A6]">{tailoredResult.rationale}</p>
            </div>
          )}
        </section>
      </main>

      {/* Simulator Modal */}
      {showSimulate && (
        <SimulateRequestModal onClose={() => setShowSimulate(false)} />
      )}

      <Footer />
    </div>
  );
}
