"use client";

import Link from "next/link";
import { Zap, ShieldCheck, Lock, Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7] dark:bg-[#111113] text-[#86868B] text-sm transition-colors" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0050FF]">
                <Zap className="h-4 w-4 text-white stroke-[2.5]" />
              </div>
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] text-base">OutcomeRouter</span>
            </Link>
            <p className="text-xs leading-relaxed text-[#6E6E73] dark:text-[#A1A1A6] max-w-sm">
              The outcome-indexed AI model gateway. Route production LLM prompts dynamically to the lowest-cost model that satisfies real-world business KPIs.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0050FF]" /> SOC 2 Type II
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <Lock className="h-3.5 w-3.5 text-[#0050FF]" /> GDPR & DPA Ready
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-white/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7]">
                <Activity className="h-3.5 w-3.5 text-[#0050FF]" /> 99.9% Uptime SLA
              </div>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/features" className="hover:text-[#0050FF] transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-[#0050FF] transition-colors">Pricing (INR & USD)</Link></li>
              <li><Link href="/case-studies" className="hover:text-[#0050FF] transition-colors">Case Studies</Link></li>
              <li><Link href="/app/benchmarks" className="hover:text-[#0050FF] transition-colors">Outcome Benchmarks</Link></li>
              <li><Link href="/app/dashboard" className="hover:text-[#0050FF] transition-colors">Dashboard Console</Link></li>
            </ul>
          </div>

          {/* Col 3: Developers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs uppercase tracking-wider">Developers</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/docs" className="hover:text-[#0050FF] transition-colors">Documentation</Link></li>
              <li><Link href="/docs" className="hover:text-[#0050FF] transition-colors">Python SDK</Link></li>
              <li><Link href="/docs" className="hover:text-[#0050FF] transition-colors">Node.js SDK</Link></li>
              <li><Link href="/docs" className="hover:text-[#0050FF] transition-colors">OpenAPI Spec</Link></li>
              <li><Link href="/docs" className="hover:text-[#0050FF] transition-colors">VSCode Extension</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-[#0050FF] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#0050FF] transition-colors">Contact Sales</Link></li>
              <li><Link href="/privacy" className="hover:text-[#0050FF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#0050FF] transition-colors">Terms of Service</Link></li>
              <li><Link href="/dpa" className="hover:text-[#0050FF] transition-colors">Data Processing (DPA)</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-[#E5E5EA] dark:border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868B]">
          <p>© 2026 Outcome-Indexed AI Spend Router Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1.5 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
            <span className="h-2 w-2 rounded-full bg-[#0050FF] animate-pulse"></span>
            All 12+ Model Gateways Operational (P95: 184ms)
          </p>
        </div>
      </div>
    </footer>
  );
}
