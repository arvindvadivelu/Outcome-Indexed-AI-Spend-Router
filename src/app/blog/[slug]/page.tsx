"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles
} from "lucide-react";

export default function SingleBlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col selection:bg-[#0050FF] selection:text-white">
      <Navbar />

      <article className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#0050FF] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all articles</span>
          </Link>

          {/* Article Header */}
          <div className="space-y-4 border-b border-[#E5E5EA] pb-8">
            <span className="font-mono text-xs text-[#0050FF] font-bold uppercase px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20">
              AI Economics & Architecture
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight leading-[1.15]">
              Why Token-Price Routing Fails: The Outcome-Indexed Alternative
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#86868B] pt-2 font-mono">
              <span>Author: Arjun Mehta</span>
              <span>Published: Aug 20, 2026</span>
              <span>Read Time: 6 min read</span>
            </div>
          </div>

          {/* Article Body */}
          <div className="space-y-6 text-[#515154] text-base leading-relaxed">
            <p className="text-xl text-[#1D1D1F] font-normal leading-relaxed">
              When software teams first embark on optimizing their burgeoning OpenAI or Anthropic bills, their immediate instinct is to look at the token price list: GPT-4o is $2.50 / 1M input, Claude 3.5 Sonnet is $3.00, and DeepSeek is $0.14.
            </p>

            <p>
              The naïve conclusion is obvious: route everything to the cheapest model per token. However, this creates a catastrophic hidden cost: <strong>the Downstream Outcome Deficit</strong>.
            </p>

            <h2 className="text-2xl font-bold text-[#1D1D1F] pt-4">The Mathematical Flaw of Token-Only Routers</h2>
            <p>
              Let C_M be the cost per prompt for Model M, and let P(Win | M, T) be the probability that Model M successfully closes the deal, merges the pull request, or resolves the support ticket for task T.
            </p>
            <p>
              If a $0.0001 model achieves an 80% outcome success rate while a $0.003 model achieves 95%, and each successful outcome represents $500 in business value, routing to the cheaper token model costs you $75 in lost customer lifetime value per prompt to save $0.0029 in API fees.
            </p>

            <div className="p-6 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3 my-6 font-mono text-xs">
              <div className="text-[#0050FF] font-bold">Outcome-Indexed Pareto Score:</div>
              <p className="text-[#1D1D1F]">
                Score(M) = w_1 · P(Win | M, T) - w_2 · Cost(M) - w_3 · Latency(M)
              </p>
              <p className="text-[#86868B]">
                Where P(Win) is dynamically sampled from an online Thompson Sampling Beta(α, β) distribution updated by live application conversion hooks.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[#1D1D1F] pt-4">How to Implement This in 5 Lines of Code</h2>
            <p>
              Rather than managing complicated prompt evaluation pipelines manually, Outcome Router wraps this entire Bayesian loop in an OpenAI-compatible interface.
            </p>

            <pre className="p-5 rounded-2xl bg-[#1D1D1F] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
{`from outcome_router import OutcomeRouterClient

router = OutcomeRouterClient(api_key="oir_live_...")

# Automatically routes to the lowest-cost model meeting your win-rate threshold
res = router.chat(
    messages=[{"role": "user", "content": "Write cold outreach for CTO"}],
    strategy="outcome_optimized",
    target_metric="demo_booked"
)

# Async conversion report:
router.record_outcome(res["_router_metadata"]["request_id"], outcome_success=True)`}
            </pre>

            <h2 className="text-2xl font-bold text-[#1D1D1F] pt-4">Conclusion</h2>
            <p>
              By shifting your AI FinOps metrics from <em>cost per token</em> to <em>cost per positive outcome</em>, you achieve the dual holy grail of modern SaaS engineering: shaving 40% off gross LLM expenditures while increasing your core business conversion rates.
            </p>
          </div>

          {/* CTA Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#EEF4FF] border border-[#0050FF]/20 space-y-4">
            <h3 className="text-xl font-bold text-[#1D1D1F]">Experience Outcome-Indexed Routing Today</h3>
            <p className="text-xs sm:text-sm text-[#515154]">
              Integrate the free tier in 5 minutes with 10,000 monthly tokens and zero credit card required.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0050FF] text-white font-bold text-xs hover:bg-[#0040CC] transition-colors shadow-apple-blue"
            >
              <span>Get Started Free</span>
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
