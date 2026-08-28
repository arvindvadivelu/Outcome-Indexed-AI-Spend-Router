"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  Play
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { SimulateRequestModal } from "./SimulateRequestModal";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  const { currency, monthlySpendUSD, baselineSpendUSD } = useAppStore();
  const [showSimulate, setShowSimulate] = useState(false);

  const rate = currency === "INR" ? 86.5 : 1;
  const currentSpend = monthlySpendUSD * rate;
  const baselineSpend = baselineSpendUSD * rate;
  const savedAmount = baselineSpend - currentSpend;

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-black/[0.05] dark:border-white/[0.08] bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl flex items-center justify-between px-6">
        {/* Left: Night Mode Toggle & Quick Search */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              placeholder="Search models, requests, rules..."
              className="w-64 sm:w-72 h-9 pl-9 pr-3.5 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-transparent dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF]/30 focus:bg-white dark:focus:bg-[#161618] transition-all"
            />
          </div>
        </div>

        {/* Right: Net Savings Pill, Simulate Button, Avatar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] text-xs">
            <span className="text-[#86868B] font-medium">Saved:</span>
            <span className="font-semibold text-[#0050FF]">
              +{formatCurrency(savedAmount, currency)}
            </span>
            <span className="text-[11px] text-[#0050FF] font-medium">(-42%)</span>
          </div>

          {/* Simulate Action Button */}
          <button
            onClick={() => setShowSimulate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25 transition-all hover:scale-[1.02]"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Simulate Request</span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center pl-2 border-l border-black/[0.06]">
            <div className="h-8 w-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
              AR
            </div>
          </div>
        </div>
      </header>

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </>
  );
}
