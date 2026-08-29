"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  ArrowRight,
  Play,
  Cpu,
  ShieldCheck,
  Layers,
  Globe,
  Sliders,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  Activity,
  Zap,
  Flame,
  Check,
  TrendingDown,
  Scale
} from "lucide-react";
import { SimulateRequestModal } from "@/components/SimulateRequestModal";

export default function HomePage() {
  const { currency, user } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [monthlySpend, setMonthlySpend] = useState(15000);
  const [showSimulate, setShowSimulate] = useState(false);

  // Interactive Live Model Telemetry State
  const [activeModelTab, setActiveModelTab] = useState<"claude" | "deepseek" | "groq">("deepseek");

  // Interactive Workflow Storytelling Stage State
  const [activeStoryStage, setActiveStoryStage] = useState<number>(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;
  const savingsPct = 42.8;
  const calculatedSavings = monthlySpend * (savingsPct / 100);

  // Model Telemetry Matrix
  const modelTelemetryData = {
    claude: {
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic API",
      costPer1k: "$0.0034",
      ttft: "68ms",
      throughput: "164 tok/s",
      winRate: "95.2%",
      savingsVsGpt4: "74%",
      slaStatus: "VERIFIED SLA",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Dominates complex code architecture, high-context extraction, and multimodal synthesis."
    },
    deepseek: {
      name: "DeepSeek-V3",
      provider: "DeepSeek AI Gateway",
      costPer1k: "$0.00042",
      ttft: "58ms",
      throughput: "198 tok/s",
      winRate: "94.6%",
      savingsVsGpt4: "88%",
      slaStatus: "ACTIVE ROUTER",
      statusColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Sub-cent frontier intelligence delivering Pareto-optimal quality for 80%+ of general workflows."
    },
    groq: {
      name: "Groq Llama 3.3 70B",
      provider: "Groq LPU Engine",
      costPer1k: "$0.00018",
      ttft: "42ms",
      throughput: "620 tok/s",
      winRate: "91.8%",
      savingsVsGpt4: "92%",
      slaStatus: "ULTRA-LOW LATENCY",
      statusColor: "text-[#0050FF] bg-[#0050FF]/10 border-[#0050FF]/20",
      description: "Unmatched 600+ tok/s streaming velocity for customer support chat, real-time voice, and classification."
    }
  };

  const selectedModel = modelTelemetryData[activeModelTab];

  // Storytelling Workflow Stages
  const storyStages = [
    {
      step: "01",
      title: "Keystroke Pre-Warming",
      badge: "Sub-70ms TTFT",
      summary: "Predicts user prompt intent while typing using client-side SLM tensors, establishing model cache before keystrokes finish.",
      metric: "75.6% Latency Cut",
      visualDetail: "Sliding Window Vectorizer"
    },
    {
      step: "02",
      title: "Bayesian Thompson Routing",
      badge: "ε=0.5 Differential Privacy",
      summary: "Continuously arbitrates traffic across Pareto-frontier models using Dirichlet reward distributions rather than static fallback rules.",
      metric: "94.6% Optimal Match",
      visualDetail: "Dirichlet Prior Estimator"
    },
    {
      step: "03",
      title: "Cryptographic SLA Escrow",
      badge: "SHA-256 Escrow Lock",
      summary: "Every prompt execution locks collateral in smart escrow. If latency or accuracy breaches contract thresholds, tokens are refunded instantly.",
      metric: "100% Zero-Loss SLA",
      visualDetail: "Deterministic Audit Ledger"
    },
    {
      step: "04",
      title: "Semantic Delta Caching",
      badge: "-58.4% Token Payload",
      summary: "Multi-turn prompts transmit cryptographic <delta_ref> pointers instead of retransmitting repeated conversation prefixes.",
      metric: "512k+ Avoided Tokens",
      visualDetail: "Cryptographic Pointer Tree"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF]/20 selection:text-[#0050FF] antialiased" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-12 sm:pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-28 sm:space-y-36">
        {/* 1. Master Hero Section — Choreographed Visual Entrance */}
        <section className="text-center space-y-8 sm:space-y-10 max-w-4xl mx-auto pt-4 sm:pt-8" suppressHydrationWarning>
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.06]">
              Stop Paying for Models. <br />
              <span className="bg-gradient-to-r from-[#0050FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                Pay for Successful Outcomes.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[#86868B] max-w-2xl mx-auto leading-relaxed font-normal">
              The intelligent AI gateway dynamically routing prompt traffic across DeepSeek, Claude 3.5, and Groq based on marginal business conversion KPIs—cutting enterprise AI spend by 40%+ under cryptographic Micro-SLA escrow.
            </p>
          </div>

          {/* Primary & Secondary Action Capsule */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={mounted && user ? "/app/dashboard" : "/auth/signin"}
              className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#0050FF] text-white text-sm font-semibold hover:bg-[#0043D6] shadow-[0_8px_24px_rgba(0,80,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Production Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setShowSimulate(true)}
              className="w-full sm:w-auto h-12 px-8 rounded-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.1] text-[#1D1D1F] dark:text-[#F5F5F7] text-sm font-semibold hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current text-[#0050FF]" />
              <span>Simulate Live Request</span>
            </button>
          </div>

          {/* Hyper-Realistic 3D Product Interface Showcase & Interactive Telemetry Matrix */}
          <div className="pt-10 sm:pt-14 relative" suppressHydrationWarning>
            {/* Cinematic Ambient Studio Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-[#0050FF]/20 via-indigo-500/15 to-transparent rounded-full blur-[110px] pointer-events-none" />

            <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden p-2 sm:p-3 bg-white/40 dark:bg-white/[0.04] backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.08)] dark:shadow-[0_40px_100px_rgba(0,80,255,0.2)] transition-all duration-700 hover:shadow-[0_40px_110px_rgba(0,80,255,0.28)]">
              <div className="relative rounded-[22px] sm:rounded-[30px] overflow-hidden border border-black/[0.04] dark:border-white/[0.06] bg-[#0A0D12]">
                <Image
                  src="/images/spatial-card.jpg"
                  alt="Outcome Router Real-Time Telemetry Dashboard"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover"
                  priority
                />

                {/* Minimalist Floating Live Control Bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-[#0A0D12]/95 via-[#0A0D12]/70 to-transparent flex flex-wrap items-center justify-between gap-4 text-xs text-white/90">
                  <div className="flex items-center gap-5">
                    <span className="flex items-center gap-2 font-mono">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Average TTFT: <strong>58ms</strong>
                    </span>
                    <span className="font-mono text-white/70 hidden sm:inline">
                      Router Efficiency: <strong className="text-emerald-400">94.2%</strong>
                    </span>
                  </div>

                  {/* Interactive Model Switcher Capsule */}
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                    {(["deepseek", "claude", "groq"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setActiveModelTab(m)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          activeModelTab === m
                            ? "bg-white text-black shadow-xs font-bold"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {m === "deepseek" ? "DeepSeek-V3" : m === "claude" ? "Claude 3.5" : "Groq LPU"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Model Telemetry Micro-Card */}
            <div className="mt-4 p-5 rounded-2xl bg-white/70 dark:bg-[#151518]/70 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left animate-in fade-in transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedModel.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedModel.statusColor}`}>
                    {selectedModel.slaStatus}
                  </span>
                  <span className="text-xs text-[#86868B]">({selectedModel.provider})</span>
                </div>
                <p className="text-xs text-[#86868B] max-w-xl">{selectedModel.description}</p>
              </div>

              <div className="flex items-center gap-6 shrink-0 font-mono text-xs">
                <div>
                  <span className="text-[#86868B] block text-[10px] uppercase">Cost / 1k</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedModel.costPer1k}</span>
                </div>
                <div>
                  <span className="text-[#86868B] block text-[10px] uppercase">TTFT</span>
                  <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{selectedModel.ttft}</span>
                </div>
                <div>
                  <span className="text-[#86868B] block text-[10px] uppercase">Savings</span>
                  <span className="font-bold text-[#0050FF] dark:text-[#3374FF]">-{selectedModel.savingsVsGpt4}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Product Workflow Storytelling (4 Continuous Stages) */}
        <section className="space-y-10 sm:space-y-14" suppressHydrationWarning>
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              How Outcome-Indexed Routing Works
            </h2>
            <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
              Explore the 4 autonomous stages executing on every incoming prompt at the network edge
            </p>
          </div>

          {/* Interactive Step Navigator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {storyStages.map((stage, idx) => {
              const isActive = activeStoryStage === idx + 1;
              return (
                <button
                  key={stage.step}
                  onClick={() => setActiveStoryStage(idx + 1)}
                  className={`p-6 rounded-[26px] text-left transition-all relative overflow-hidden group ${
                    isActive
                      ? "bg-[#0050FF] text-white shadow-[0_12px_32px_rgba(0,80,255,0.3)] scale-[1.02]"
                      : "bg-white/75 dark:bg-[#151518]/75 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-mono font-bold ${isActive ? "text-white/80" : "text-[#86868B]"}`}>
                      STAGE {stage.step}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF]"
                      }`}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className={`font-bold text-base mb-2 tracking-tight ${isActive ? "text-white" : "text-[#1D1D1F] dark:text-[#F5F5F7]"}`}>
                    {stage.title}
                  </h3>

                  <p className={`text-xs leading-relaxed mb-4 ${isActive ? "text-white/80" : "text-[#86868B]"}`}>
                    {stage.summary}
                  </p>

                  <div className={`pt-3 border-t text-[11px] font-mono font-bold flex items-center justify-between ${
                    isActive ? "border-white/20 text-white" : "border-black/[0.04] dark:border-white/[0.06] text-emerald-600 dark:text-emerald-400"
                  }`}>
                    <span>{stage.metric}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Structured 4-Pillar Glass Feature Grid */}
        <section className="space-y-12 sm:space-y-16" suppressHydrationWarning>
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Engineered for Outcome Efficiency
            </h2>
            <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
              Four breakthrough systems working in harmony at the network edge
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Speculative Prewarming */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all group">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] flex items-center justify-center shadow-xs">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Keystroke Pre-Warming
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Predicts user prompt intent while typing via sliding window SLM tensors, reducing TTFT to <strong>68.4ms (75.6% faster)</strong>.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">Sub-70ms Edge Response</span>
              </div>
            </div>

            {/* Card 2: Micro-SLA Escrow */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all group">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Micro-SLA Escrow
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Cryptographic SHA-256 contracts with instant token refunds if model latency or quality breaches SLA bounds.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">100% Verifiable Refunds</span>
              </div>
            </div>

            {/* Card 3: Semantic Delta Cache */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all group">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Semantic Delta Diffing
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Multi-turn chat prompts avoid re-sending conversation prefixes by sending cryptographic &lt;delta_ref&gt; pointers.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">-58.4% Token Payload</span>
              </div>
            </div>

            {/* Card 4: DP Federated Priors */}
            <div className="rounded-[30px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-7 shadow-sm flex flex-col justify-between space-y-6 hover:translate-y-[-2px] transition-all group">
              <div className="space-y-4">
                <div className="h-11 w-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                  Differential Privacy Priors
                </h3>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Cross-tenant Bayesian Thompson sampling with ε=0.5 Laplacian noise eliminates cold-start model exploration.
                </p>
              </div>
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">Zero Cold Start Loss</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Interactive Enterprise Spend ROI Estimator */}
        <section className="rounded-[36px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 sm:p-14 shadow-sm space-y-10 max-w-4xl mx-auto" suppressHydrationWarning>
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Interactive Enterprise Spend ROI Estimator
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B]">
              Slide to your monthly raw OpenAI / Anthropic spend to calculate projected net recovery
            </p>
          </div>

          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#86868B]">Current Monthly Raw Spend:</span>
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
              <div className="p-7 rounded-[28px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] text-white shadow-[0_16px_36px_rgba(0,80,255,0.28)] space-y-1 flex flex-col justify-center">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Estimated Net Savings</span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                  +{formatCurrency(calculatedSavings * rate, activeCurrency)} / mo
                </div>
                <p className="text-xs text-white/80 font-semibold pt-1">42.8% immediate margin recovery</p>
              </div>

              <div className="p-7 rounded-[28px] bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06] space-y-1 flex flex-col justify-center">
                <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider">Annual Capital Saved</span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap overflow-hidden text-ellipsis">
                  +{formatCurrency(calculatedSavings * 12 * rate, activeCurrency)} / yr
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Enterprise Verification & Performance SLA Trust Bar */}
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
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">0-Code</div>
            <div className="text-xs text-[#86868B] font-medium">SDK Drop-in Migration</div>
          </div>
        </section>

        {/* 6. Apple-Spatial Final Call to Action */}
        <section className="rounded-[36px] bg-gradient-to-br from-[#0B1528] via-[#0038A8] to-[#0050FF] p-8 sm:p-16 text-white shadow-[0_24px_60px_rgba(0,80,255,0.32)] text-center space-y-6 relative overflow-hidden" suppressHydrationWarning>
          <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Recover 40%+ of Your LLM Spend?
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
              Integrate in 1 line of code with LangChain, LlamaIndex, or OpenAI SDK. Free Sandbox tier includes 10,000 monthly tokens with zero setup fees.
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

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </div>
  );
}
