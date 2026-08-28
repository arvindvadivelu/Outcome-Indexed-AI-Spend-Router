"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Zap,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Scale,
  Bot,
  Sliders,
  Gauge,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  const aiEngines = [
    {
      icon: BrainCircuit,
      title: "Zero-Shot Complexity Classifier",
      badge: "Inference Intelligence",
      description:
        "Analyzes prompt tokens, syntactic structure, and multi-turn context in <2ms to determine the minimum viable model tier before dispatch.",
      bulletPoints: [
        "Instant zero-shot categorization (Code, Sales, Support, Math, Extraction)",
        "Complexity scoring [0.0 - 1.0] avoids over-provisioning expensive models",
        "Sub-2ms evaluation with zero noticeable user latency"
      ]
    },
    {
      icon: Scale,
      title: "Synthetic LLM-as-a-Judge Prior Bootstrapper",
      badge: "Cold-Start Elimination",
      description:
        "When connecting a new model or task, automated LLM judges evaluate golden benchmark datasets to initialize calibrated Beta(α, β) priors instantly.",
      bulletPoints: [
        "Eliminates cold-start exploration penalties for newly connected models",
        "Automated synthetic benchmark evaluation across golden task suites",
        "Calibrates baseline win-rate priors before routing live production traffic"
      ]
    },
    {
      icon: Bot,
      title: "Autonomous Outcome Verifier",
      badge: "Self-Learning Loop",
      description:
        "An async reflection agent checks syntax validity, tone empathy, and user follow-up signals to record positive/negative outcome rewards automatically.",
      bulletPoints: [
        "Automatically scores completion quality without requiring manual human tags",
        "Implicit signal analyzer deduces wins from copy actions and retry loops",
        "Maintains continuous Bayesian learning in production"
      ]
    },
    {
      icon: Zap,
      title: "Speculative Dual-Model Execution",
      badge: "Latency Reduction",
      description:
        "Dispatches queries simultaneously to ultra-fast inference (Groq Llama 3.3 in 84ms) and deep reasoning models (Claude 3.5), cutting P95 latency by 60%.",
      bulletPoints: [
        "60% reduction in tail P95 latency for real-time customer applications",
        "Cancels slower inference when fast model passes quality bar",
        "Guarantees fast response without risking output quality"
      ]
    },
    {
      icon: Sliders,
      title: "Natural Language Policy Synthesizer",
      badge: "Prompt-to-Policy",
      description:
        "Declare business targets in plain English: 'Ensure SDR emails achieve >90% reply rates under $0.002'. The synthesizer builds executable routing JSON.",
      bulletPoints: [
        "No complex JSON configurations or manual rule authoring required",
        "Automatically infers task conditions, fallback chains, and SLA limits",
        "1-click testing and deployment to active production endpoints"
      ]
    },
    {
      icon: Gauge,
      title: "Autonomous Budget Auto-Pilot",
      badge: "FinOps Automation",
      description:
        "Monitors daily burn rate vs. monthly budget ceilings to dynamically pace model weights and guarantee $0 budget overruns.",
      bulletPoints: [
        "Guarantees zero monthly budget overruns with dynamic weight pacing",
        "Auto-escalates mission-critical tasks during budget surpluses",
        "Seamlessly integrates with Stripe and custom enterprise billing"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEF4FF] text-[#0050FF] text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Core Architecture</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1D1D1F]">
              6 Autonomous AI Subsystems
            </h1>
            <p className="text-base text-[#6E6E73]">
              The mathematical algorithms and intelligence engines powering outcome-indexed routing.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiEngines.map((engine, idx) => {
              const Icon = engine.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-xl bg-[#EEF4FF] text-[#0050FF] flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#0050FF] bg-[#EEF4FF] px-2.5 py-0.5 rounded-full">
                        {engine.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#1D1D1F]">{engine.title}</h3>
                    <p className="text-xs text-[#6E6E73] leading-relaxed">{engine.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#F5F5F7] space-y-2">
                    {engine.bulletPoints.map((bp, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs text-[#515154]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0050FF] flex-shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-sm text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F]">
              Ready to Cut Your LLM Spend by 40%?
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6E73] max-w-xl mx-auto">
              Drop our 5-line SDK client into your existing OpenAI codebase and start optimizing outcomes immediately.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/auth/signup"
                className="px-6 py-2.5 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25 transition-all"
              >
                Get Started Free
              </Link>
              <Link
                href="/docs"
                className="px-6 py-2.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBEF] transition-all"
              >
                Read Documentation
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
