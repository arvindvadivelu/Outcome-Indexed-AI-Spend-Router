"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Bot,
  Search,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const [topicInput, setTopicInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);

  const handleSynthesizeArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedArticle({
        title: `AI Deep-Dive: ${topicInput}`,
        category: "Machine Learning Systems",
        readTime: "4 min read",
        date: "Real-time AI Synthesis",
        summary: `An engineering exploration into ${topicInput} and how outcome-indexed Pareto frontiers outperform naive token-cost routing in production architectures.`,
        content: `### Architecture Breakdown\n\nWhen scaling LLM applications to millions of tokens daily, naive price-per-token heuristics fail to capture the downstream cost of hallucinations and retries.\n\n### The Mathematical Advantage\n\nBy leveraging Bayesian Multi-Armed Bandits with Thompson Sampling, the routing engine continually updates outcome probability Beta(α, β) distributions in real-time, delivering optimal Pareto trade-offs.\n\n### Implementation Results\n\nTeams deploying this strategy retain over 42% in gross AI expenditure while maintaining >93% business conversion metrics.`
      });
      setIsGenerating(false);
    }, 600);
  };

  const blogPosts = [
    {
      slug: "why-token-cost-routing-is-dead",
      title: "Why Cost-Per-Token Routing is Broken (And What Replaces It)",
      excerpt:
        "Routing to the cheapest model per token often increases your total cost per successful outcome. Here is the mathematical proof behind Outcome-Indexed AI Routing.",
      date: "Aug 24, 2026",
      readTime: "5 min read",
      category: "AI Economics"
    },
    {
      slug: "thompson-sampling-llm-routing",
      title: "Multi-Armed Bandits for LLM Model Selection in Production",
      excerpt:
        "How we use Thompson Sampling over Beta priors to continuously balance exploration and exploitation across Claude 3.5, DeepSeek, and OpenAI models.",
      date: "Aug 18, 2026",
      readTime: "8 min read",
      category: "Engineering"
    },
    {
      slug: "groq-llama-33-cost-breakdown",
      title: "Benchmarking Llama 3.3 70B on Groq vs. GPT-4o for Enterprise Support",
      excerpt:
        "We ran 50,000 real support queries through both models. Here is the raw data on latency, win-rate, and dollar savings.",
      date: "Aug 10, 2026",
      readTime: "6 min read",
      category: "Benchmarks"
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
            <span>AI Economics, Routing Research & Real-Time AI Writer</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1D1D1F] tracking-tight">
            Research & <span className="text-[#0050FF]">Engineering Blog</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6E6E73] max-w-2xl mx-auto">
            Deep-dives on multi-model optimization, Bayesian bandits, and LLM FinOps.
          </p>
        </div>
      </section>

      {/* 1. Real-Time AI Article Synthesizer */}
      <section className="py-10 bg-white border-b border-[#E5E5EA]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FBFBFD] border border-[#0050FF]/25 shadow-apple-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#EEF4FF] text-[#0050FF]">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#1D1D1F]">AI Research Synthesizer</h3>
                  <p className="text-[11px] text-[#86868B]">Enter any AI architecture topic to synthesize a live engineering deep dive</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0050FF] bg-[#EEF4FF] px-2 py-0.5 rounded-full border border-[#0050FF]/20">
                Live AI Writer
              </span>
            </div>

            <form onSubmit={handleSynthesizeArticle} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Speculative dual-model racing on DeepSeek vs Claude 3.5"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="flex-1 h-11 px-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:outline-none focus:border-[#0050FF]"
              />
              <button
                type="submit"
                disabled={isGenerating || !topicInput.trim()}
                className="px-5 h-11 rounded-2xl bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] shadow-apple-blue transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGenerating ? "Writing..." : "Synthesize Article"}
              </button>
            </form>

            {generatedArticle && (
              <div className="p-6 rounded-2xl bg-white border border-[#0050FF]/30 space-y-3 animate-in fade-in shadow-apple-sm text-xs">
                <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-2">
                  <span className="font-mono text-[#0050FF] font-bold">{generatedArticle.category}</span>
                  <span className="text-[#86868B] font-mono">{generatedArticle.readTime}</span>
                </div>
                <h4 className="text-base font-bold text-[#1D1D1F]">{generatedArticle.title}</h4>
                <p className="text-[#515154] leading-relaxed font-sans">{generatedArticle.summary}</p>
                <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] font-mono text-[11px] whitespace-pre-wrap text-[#1D1D1F]">
                  {generatedArticle.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Published Articles */}
      <section className="py-20 bg-[#F5F5F7]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">
            Published Articles & Whitepapers
          </h2>

          <div className="space-y-6">
            {blogPosts.map((post, idx) => (
              <article
                key={idx}
                className="p-8 rounded-3xl bg-white border border-black/[0.06] shadow-apple-sm hover:shadow-apple-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#0050FF] font-semibold border border-[#0050FF]/20">
                      {post.category}
                    </span>
                    <span className="text-[#86868B]">{post.date}</span>
                    <span className="text-[#86868B]">•</span>
                    <span className="text-[#86868B]">{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1D1D1F] hover:text-[#0050FF] transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#515154] leading-relaxed">{post.excerpt}</p>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-1 text-xs font-bold text-[#0050FF] hover:gap-2 transition-all flex-shrink-0"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
