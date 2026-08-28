"use client";

import { useState, useEffect } from "react";
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
  Globe,
  Code2,
  Check,
  ChevronRight,
  Activity,
  Coins
} from "lucide-react";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function HomePage() {
  const { currency } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [monthlySpend, setMonthlySpend] = useState(15000);
  const [activeTab, setActiveTab] = useState<"sales" | "code" | "support">("sales");
  const [showSimulate, setShowSimulate] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic AI Workload Tailor state
  const [customWorkloadInput, setCustomWorkloadInput] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResult, setTailoredResult] = useState<any>(null);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;
  const savingsPct = 42.8;
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
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF]" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-8 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* 1. Apple Pro Spatial Hero Section */}
        <section className="relative overflow-hidden rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-center space-y-8" suppressHydrationWarning>
          {/* Spatial Multi-Layer Gradients */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#0050FF]/20 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.08] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-pulse" />
              <span className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Outcome-Indexed AI Spend Router · V2
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.1]">
              Stop Paying for &ldquo;Best Models&rdquo;. <br />
              <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Pay for Successful Outcomes.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
              The intelligent AI gateway dynamically routing prompt traffic across DeepSeek, Claude 3.5, and Groq based on marginal business conversion KPIs—cutting enterprise AI spend by 40%+ under cryptographic Micro-SLA escrow.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-[0_6px_20px_rgba(0,80,255,0.35)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Launch Production Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <button
                onClick={() => setShowSimulate(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/80 dark:bg-[#242428]/80 backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs font-semibold hover:bg-[#F5F5F7] dark:hover:bg-[#323236] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Play className="h-3.5 w-3.5 fill-current text-[#0050FF]" />
                <span>Simulate Live Request</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. Apple Vision Spatial Bento Grid — 4 Core Breakthrough Pillars */}
        <section className="space-y-6" suppressHydrationWarning>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Engineered for Highest Outcome Efficiency
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Four breakthrough systems working in harmony at the network edge
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Speculative Prewarming */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Keystroke Pre-Warming
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Predicts user prompt intent while typing via sliding window SLM tensors, reducing TTFT to <strong>68.4ms (75.6% faster)</strong>.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Sub-70ms Edge Response</span>
              </div>
            </div>

            {/* Card 2: Micro-SLA Escrow */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Micro-SLA Cryptographic Vault
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Every request receives a SHA-256 escrow nonce. If upstream API latencies breach SLA thresholds, refunds are automatically credited.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">0-Loss Latency SLA</span>
              </div>
            </div>

            {/* Card 3: Semantic Delta Diffing */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Semantic Delta Diffing
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Replaces repeated system prompt prefixes with lightweight <code>&lt;delta_ref&gt;</code> pointers, cutting ingestion volume by <strong>60.3%</strong>.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">512K+ Tokens Avoided</span>
              </div>
            </div>

            {/* Card 4: Federated Thompson Priors */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 shadow-sm flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Federated Dirichlet Priors
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Learns from 480+ cross-tenant workloads under &epsilon;=0.5 Differential Privacy to solve cold-start routing in under 10ms.
                </p>
              </div>
              <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">480+ Tenant Consensus</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive ROI & Spend Savings Calculator */}
        <section className="rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-12 shadow-sm space-y-8 max-w-4xl mx-auto" suppressHydrationWarning>
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Interactive Enterprise Spend ROI Estimator
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Slide to see how much capital your team avoids by switching from single-model brute force to outcome routing
            </p>
          </div>

          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#86868B]">Current Monthly Raw LLM Spend:</span>
              <span className="text-xl font-extrabold font-mono text-[#0050FF] dark:text-[#3374FF]">
                {formatCurrency(monthlySpend * rate, activeCurrency)} / mo
              </span>
            </div>

            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(parseInt(e.target.value))}
              className="w-full accent-[#0050FF] h-2.5 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg cursor-pointer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] space-y-1">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Estimated Net Savings</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono">
                  +{formatCurrency(calculatedSavings * rate, activeCurrency)} / mo
                </div>
                <p className="text-xs text-white/80 font-semibold pt-1">42.8% immediate margin recovery</p>
              </div>

              <div className="p-6 rounded-[28px] bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
                <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Annual Capital Saved</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">
                  +{formatCurrency(calculatedSavings * 12 * rate, activeCurrency)} / yr
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">Guaranteed under Micro-SLA escrow</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Scenario Outcome Comparison Matrix */}
        <section className="rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-12 shadow-sm space-y-8" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                Empirical Pareto Conversion Comparison
              </h2>
              <p className="text-xs text-[#86868B]">
                See how domain-specialized routing beats unrouted GPT-4o control models on real business outcomes
              </p>
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#242428]/80 backdrop-blur-md">
              {(["sales", "code", "support"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full capitalize transition-all ${
                    activeTab === tab
                      ? "bg-white dark:bg-[#343438] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F]"
                  }`}
                >
                  {tab === "sales" ? "Outbound Sales" : tab === "code" ? "Code Review" : "Support FAQ"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: Unrouted GPT-4o */}
            <div className="p-6 rounded-[28px] bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#86868B]">Unrouted GPT-4o Brute Force</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  CONTROL
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Cost per request:</span>
                  <span className="font-mono font-bold text-red-500">{currentScenario.baselineCost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Target Metric:</span>
                  <span className="font-semibold">{currentScenario.targetKpi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Avg SLA Latency:</span>
                  <span className="font-mono">380ms</span>
                </div>
              </div>
            </div>

            {/* Right: Outcome-Indexed Router */}
            <div className="p-6 rounded-[28px] bg-gradient-to-br from-[#EEF4FF] via-white to-[#F5F5F7] dark:from-[#0050FF]/15 dark:via-[#161618] dark:to-[#1C1C1E] border border-[#0050FF]/30 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#0050FF] dark:text-[#3374FF]">
                  Outcome-Indexed Gateway ({currentScenario.winnerModel})
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {currentScenario.savings}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Cost per request:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentScenario.winnerCost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Empirical Win Rate:</span>
                  <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">{currentScenario.winnerWinRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#86868B]">Business Impact:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentScenario.kpiImpact}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Apple Spatial Final CTA */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-14 text-white shadow-[0_20px_50px_rgba(0,80,255,0.35)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Recover 40%+ of Your LLM Spend?
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Integrate in 1 line of code with LangChain, LlamaIndex, or OpenAI SDK. Free Sandbox tier includes 500,000 monthly tokens with zero setup fees.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#0050FF] font-bold text-xs hover:bg-neutral-100 transition-all shadow-md"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-all border border-white/20"
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
