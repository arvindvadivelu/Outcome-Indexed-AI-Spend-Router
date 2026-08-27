"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Zap,
  Sparkles,
  GitFork,
  Database,
  ArrowRight,
  TrendingDown,
  Lock,
  Code2,
  RefreshCw,
  CheckCircle2,
  Bot,
  BrainCircuit,
  Cpu,
  ShieldAlert,
  Sliders,
  Scale,
  Gauge
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const aiEngines = [
    {
      icon: BrainCircuit,
      title: "Zero-Shot Complexity Classifier",
      badge: "Inference Intelligence",
      tagline: "Sub-Millisecond Task Complexity & Domain Detection",
      description:
        "Analyzes raw prompt tokens, syntactic keywords, and multi-turn conversational depth in <2ms using small language model (SLM) embeddings. Accurately determines the minimum viable model tier before dispatch.",
      bulletPoints: [
        "Instant zero-shot categorization (Code, Sales, Support, Math, Extraction)",
        "Continuous complexity scoring [0.0 - 1.0] avoids over-provisioning",
        "Zero latency overhead with Rust-accelerated tokenizer"
      ]
    },
    {
      icon: Scale,
      title: "Synthetic LLM-as-a-Judge Bootstrapper",
      badge: "Cold-Start Elimination",
      tagline: "Seeds Thompson Sampling Priors with 0 Human Logs",
      description:
        "When you connect a new model or task domain, our automated LLM-as-a-Judge synthetically grades golden benchmark datasets to initialize calibrated Beta(α, β) priors—delivering optimal routing from request #1.",
      bulletPoints: [
        "Eliminates cold-start exploration penalties for newly connected models",
        "Automated synthetic benchmark evaluation across 5 golden task suites",
        "Calibrates baseline win-rate priors before routing real production traffic"
      ]
    },
    {
      icon: Bot,
      title: "Autonomous Outcome Verifier",
      badge: "Self-Learning Loop",
      tagline: "Background Reflection Grades Output Conversions Automatically",
      description:
        "Solves the human feedback bottleneck. An async reflection agent inspects structural validity, code syntax, tone empathy, and implicit user follow-up signals to report positive/negative outcome rewards automatically.",
      bulletPoints: [
        "Automatically scores completion quality without requiring manual user tags",
        "Implicit signal analyzer deduces wins from copy actions and absence of retry loops",
        "Increases Thompson sampling feedback velocity by 400%"
      ]
    },
    {
      icon: Zap,
      title: "Speculative Dual-Model Execution",
      badge: "Latency Reduction",
      tagline: "Races Budget & Deep Models, Cuts P95 Latency by 60%",
      description:
        "Dispatches queries simultaneously to ultra-fast inference (Groq Llama 3.3 in 84ms) and deep reasoning models (Claude 3.5). If the budget model satisfies quality thresholds, the slow inference is instantly aborted.",
      bulletPoints: [
        "60% reduction in tail P95 latency for real-time customer support apps",
        "Automatic graceful cancellation saves compute cost on unneeded flagship runs",
        "Guarantees ultra-fast response without risking output quality"
      ]
    },
    {
      icon: Sliders,
      title: "Natural Language Policy Synthesizer",
      badge: "Prompt-to-Policy",
      tagline: "Compiles Plain English Goals into Executable Routing Algorithms",
      description:
        "Tell the AI your business goals in plain English: 'Ensure outbound SDR emails have >90% reply rates while keeping spend under $0.002'. The synthesizer generates optimal Pareto weights, SLA ceilings, and priority chains.",
      bulletPoints: [
        "No complex JSON configurations or manual rule authoring required",
        "Automatically infers task conditions, fallback chains, and SLA limits",
        "One-click testing and deployment to active production endpoints"
      ]
    },
    {
      icon: Gauge,
      title: "Autonomous Budget Auto-Pilot",
      badge: "FinOps Automation",
      tagline: "Dynamically Paces Quality Weights to Hit Exact Monthly Budgets",
      description:
        "Monitors daily burn rate vs. monthly budget ceilings. If burn accelerates, Auto-Pilot shifts traffic to high-efficiency models; if budget surplus exists, it boosts flagship allocations to maximize conversions.",
      bulletPoints: [
        "Guarantees 0% budget overruns with automated proactive throttling",
        "Surplus intelligence: automatically reinvests leftover budget for higher quality",
        "Real-time projected end-of-month spend forecasting"
      ]
    },
    {
      icon: ShieldAlert,
      title: "Self-Correction Fallback Critic",
      badge: "Zero-Hallucination",
      tagline: "Detects Budget Model Errors & Auto-Refines with Flagship",
      description:
        "Acts as a real-time post-inference quality filter. If an output from a budget model exhibits hallucinations or incomplete syntax, the Critic auto-escalates to Claude 3.5 / GPT-4o with a targeted self-correction prompt.",
      bulletPoints: [
        "Prevents bad completions from ever reaching your end-users",
        "Automated self-correction prompt injection repairs truncated reasoning",
        "Maintains 99.8% production reliability across mixed-model tiers"
      ]
    },
    {
      icon: RefreshCw,
      title: "Generative Context Distiller",
      badge: "Token Efficiency",
      tagline: "Trims Prompt Length by 30–50% Without Semantic Loss",
      description:
        "High-speed context compression analyzes conversational histories, strips redundant system boilerplate, collapses duplicate whitespace, and preserves critical formatting constraints.",
      bulletPoints: [
        "Cuts input token bills by up to 50% on multi-turn customer conversations",
        "Preserves strict system instructions, schemas, and few-shot examples",
        "Compatible with exact and semantic pgvector prompt caches"
      ]
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
            <span>Autonomous Multi-Agent Routing Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1D1D1F] tracking-tight">
            The Autonomous <span className="text-[#0050FF]">AI Brain</span> Behind the Router
          </h1>
          <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl mx-auto leading-relaxed">
            Discover the 8 interconnected AI subsystems that eliminate cold starts, prevent hallucinations, reduce latency, and pace budgets automatically.
          </p>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 bg-[#F5F5F7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiEngines.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md hover:border-[#0050FF]/30 transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#0050FF] uppercase px-2.5 py-0.5 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#1D1D1F]">{feat.title}</h3>
                      <span className="text-[11px] font-mono font-bold text-[#0050FF] block mt-1">
                        {feat.tagline}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5EA] space-y-2">
                    {feat.bulletPoints.map((bp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#515154]">
                        <CheckCircle2 className="h-4 w-4 text-[#0050FF] flex-shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 border-t border-black/[0.06] bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F]">
            Experience Autonomous Routing on Your Production Data
          </h2>
          <p className="text-[#6E6E73] text-sm max-w-xl mx-auto">
            Test the live simulator or generate AI routing policies in plain English.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app/dashboard"
              className="px-8 py-3.5 rounded-full bg-[#0050FF] text-white font-bold text-sm hover:bg-[#0040CC] transition-all shadow-apple-blue"
            >
              Open Live Console
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] font-semibold text-sm hover:bg-[#EBEBEF] transition-all"
            >
              View Pricing Tiers
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
