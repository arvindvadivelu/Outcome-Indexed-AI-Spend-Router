"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  Activity,
  Play
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { SimulateRequestModal } from "./SimulateRequestModal";

export function AppHeader() {
  const { currency, monthlySpendUSD, baselineSpendUSD } = useAppStore();
  const [showSimulate, setShowSimulate] = useState(false);

  const rate = currency === "INR" ? 86.5 : 1;
  const currentSpend = monthlySpendUSD * rate;
  const baselineSpend = baselineSpendUSD * rate;
  const savedAmount = baselineSpend - currentSpend;

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur-xl flex items-center justify-between px-6">
        {/* Left: Search & Cluster Status */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
            <input
              type="text"
              placeholder="Search models, request IDs, rules..."
              className="w-64 sm:w-80 h-9 pl-9 pr-3 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0050FF] focus:bg-white transition-all"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF4FF] border border-[#0050FF]/20 text-[11px] font-mono text-[#0050FF] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0050FF] animate-pulse"></span>
            <span>Gateway P95: 184ms</span>
          </div>
        </div>

        {/* Right: Net Savings Pill, Simulate Button, Notifications, Avatar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs">
            <span className="text-[#86868B] font-medium">Net Savings:</span>
            <span className="font-mono font-bold text-[#0050FF]">
              +{formatCurrency(savedAmount, currency)}
            </span>
            <span className="text-[10px] text-[#0050FF] font-mono font-semibold">(-42.0%)</span>
          </div>

          {/* Simulate Action Button */}
          <button
            onClick={() => setShowSimulate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0040CC] shadow-sm shadow-[#0050FF]/25 transition-all hover:scale-105"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Simulate Prompt</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-[#515154] hover:text-[#1D1D1F] transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#0050FF]"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5EA]">
            <div className="h-8 w-8 rounded-full bg-[#0050FF] flex items-center justify-center font-bold text-white text-xs shadow-sm">
              AM
            </div>
          </div>
        </div>
      </header>

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </>
  );
}
