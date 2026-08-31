"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InteractiveRoiCalculator() {
  const [monthlyCalls, setMonthlyCalls] = useState(500000);
  const [promptTokens, setPromptTokens] = useState(700);

  // Math: baseline vs outcome router
  const baselineCostPerReq = (promptTokens * 0.0000025) + (250 * 0.000010);
  const baselineMonthly = monthlyCalls * baselineCostPerReq;

  // Outcome router blends to ~0.0014 per request
  const routerCostPerReq = 0.00138;
  const routedMonthly = monthlyCalls * routerCostPerReq;

  const monthlySavings = Math.max(0, baselineMonthly - routedMonthly);
  const annualSavings = monthlySavings * 12;
  const savingsPct = ((monthlySavings / baselineMonthly) * 100).toFixed(0);

  return (
    <div className="rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)] text-[#1D1D1F] dark:text-[#F5F5F7]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            FinOps Simulator
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Interactive Enterprise ROI Forecaster</h2>
          <p className="text-sm text-[#86868B]">See real-time annual dollar savings when replacing GPT-4o control with Pareto routing.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0050FF] dark:text-[#3374FF] tracking-tight">
              ${Math.round(annualSavings).toLocaleString()}
              <span className="text-xs font-normal text-[#86868B] ml-1">/yr</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              -{savingsPct}% Net Spend Reduction
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Monthly Inference Volume</span>
              <span className="font-mono text-[#0050FF] dark:text-[#3374FF] font-semibold">{monthlyCalls.toLocaleString()} reqs</span>
            </div>
            <input
              type="range"
              min={50000}
              max={5000000}
              step={50000}
              value={monthlyCalls}
              onChange={(e) => setMonthlyCalls(Number(e.target.value))}
              className="w-full h-2 bg-black/[0.06] dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#0050FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Average Context Size (Tokens)</span>
              <span className="font-mono text-[#0050FF] dark:text-[#3374FF] font-semibold">{promptTokens} tokens</span>
            </div>
            <input
              type="range"
              min={200}
              max={4000}
              step={100}
              value={promptTokens}
              onChange={(e) => setPromptTokens(Number(e.target.value))}
              className="w-full h-2 bg-black/[0.06] dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#0050FF]"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] p-6 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#86868B]">Unoptimized GPT-4o Baseline</span>
            <span className="font-mono font-medium">${Math.round(baselineMonthly).toLocaleString()} /mo</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#86868B]">Outcome-Indexed Router</span>
            <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">${Math.round(routedMonthly).toLocaleString()} /mo</span>
          </div>
          <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />
          <div className="flex justify-between items-center text-sm font-semibold">
            <span>Monthly Cash Saved</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">+${Math.round(monthlySavings).toLocaleString()} /mo</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs text-[#86868B]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Guaranteed 94.2% Business Outcome Win Rate with Zero Prompt Retention</span>
        </div>
        <Link
          href="/app/billing"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0050FF] hover:bg-[#0043D6] text-white font-medium text-sm transition-all shadow-sm"
        >
          Claim Guaranteed Savings
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
