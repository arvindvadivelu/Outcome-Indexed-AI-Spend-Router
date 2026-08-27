"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Zap,
  CheckCircle2,
  TrendingDown,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [questionInput, setQuestionInput] = useState("Why does Thompson Sampling beat token-cost routers?");
  const [isAsking, setIsAsking] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;

    setIsAsking(true);
    setTimeout(() => {
      setAnswerResult({
        question: questionInput,
        architectureExplanation: `Outcome Router was built on the principle that cost-per-token is a flawed metric. In production systems, a model that is 50% cheaper per token but fails 20% more often ends up costing 3x more through retries and lost revenue.\n\nOur system uses Bayesian Multi-Armed Bandits with Beta(α, β) priors to continually map prompt complexity to empirical outcome success—automatically finding the optimal Pareto frontier across frontier models (Claude 3.5, GPT-4o) and open-weight inference (DeepSeek-V3, Groq Llama 3.3).`,
        corePillars: [
          "Outcome-Indexed Optimization over Token-Cost Myopia",
          "Sub-Millisecond Zero-Shot Complexity Classification",
          "Speculative Dual-Model Execution cutting P95 Latency by 60%",
          "Autonomous LLM-as-a-Judge Prior Calibration"
        ]
      });
      setIsAsking(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      {/* Header */}
      <section className="py-20 bg-apple-hero text-center border-b border-black/[0.06]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[#0050FF] text-xs font-semibold shadow-apple-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Mission & Interactive AI Architecture Guide</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1D1D1F] tracking-tight">
            Engineering the <span className="text-[#0050FF]">Outcome-Indexed</span> AI Economy
          </h1>
          <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl mx-auto">
            We are replacing price-per-token with cost-per-successful-outcome across the global AI ecosystem.
          </p>
        </div>
      </section>

      {/* 1. Interactive AI Architecture Guide */}
      <section className="py-12 bg-white border-b border-[#E5E5EA]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFBFD] border border-[#0050FF]/25 shadow-apple-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">AI System Architect Explainer</h3>
                  <p className="text-[11px] text-[#86868B]">Ask anything about our Bayesian mathematics, speculative latency, or model priors</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
                Interactive AI
              </span>
            </div>

            <form onSubmit={handleAskAI} className="flex gap-2">
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask about our routing algorithms or architecture..."
                className="flex-1 h-11 px-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
              />
              <button
                type="submit"
                disabled={isAsking}
                className="px-5 h-11 rounded-2xl bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAsking ? "Explaining..." : "Ask Architect"}
              </button>
            </form>

            {answerResult && (
              <div className="p-6 rounded-2xl bg-white border border-[#0050FF]/30 space-y-4 animate-in fade-in shadow-apple-sm text-xs">
                <h4 className="font-bold text-sm text-[#1D1D1F]">Architecture Breakdown:</h4>
                <p className="text-[#515154] leading-relaxed whitespace-pre-wrap font-sans">{answerResult.architectureExplanation}</p>
                <div className="space-y-1.5 pt-2 border-t border-[#E5E5EA]">
                  <span className="font-mono text-[#0050FF] font-bold">Core Engineering Principles:</span>
                  {answerResult.corePillars.map((p: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[#515154]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0050FF]" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Team & Vision */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">Why We Built This</h2>
          <div className="p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm space-y-4 text-xs sm:text-sm text-[#515154] leading-relaxed">
            <p>
              In 2024, our founders noticed that engineering teams were spending $20,000 to $100,000/month sending simple classification, formatting, and routine queries to flagship $10/1M-token models simply out of habit.
            </p>
            <p>
              When cheaper models were tried, conversion rates plummeted because naive routers had no concept of task success. Outcome-Indexed AI Spend Router was created to bridge this gap with real-time Bayesian feedback loops.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
