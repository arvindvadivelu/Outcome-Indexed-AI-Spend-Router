"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";
import { AlertTriangle, Sparkles, ArrowRight, X, RotateCcw, ShieldAlert, Calendar } from "lucide-react";
import Link from "next/link";

export function QuotaAlertNotification() {
  const { currentTokens, monthlyQuota, planTier, cycleStartDate, resetTokenQuota, openPlanUpgradeModal } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isExceeded = currentTokens >= monthlyQuota;

  // Calculate 30-day reset cycle date
  const startTimestamp = cycleStartDate ? new Date(cycleStartDate).getTime() : Date.now();
  const resetTimestamp = startTimestamp + 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const msRemaining = Math.max(0, resetTimestamp - now);
  const daysRemaining = Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const resetDateString = new Date(resetTimestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  if (!isExceeded || isDismissed) {
    return null;
  }

  const activeTierName = (planTier || "Free").toUpperCase();

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      suppressHydrationWarning
    >
      <div className="relative overflow-hidden rounded-[26px] bg-white/95 dark:bg-[#161619]/95 backdrop-blur-2xl border border-red-500/30 dark:border-red-500/40 p-5 shadow-[0_20px_50px_rgba(239,68,68,0.25)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-3.5">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-red-500/15 dark:bg-red-500/25 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/30 animate-pulse">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight flex items-center gap-1.5">
                <span>Monthly Token Quota Reached</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                  HALTED
                </span>
              </h4>
              <span className="text-[11px] text-[#86868B]">Gateway execution is currently paused</span>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="h-7 w-7 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quota Metric & Reset Countdown Card */}
        <div className="p-3.5 rounded-2xl bg-red-500/[0.06] dark:bg-red-500/[0.12] border border-red-500/20 text-xs space-y-2 relative z-10">
          <div className="flex justify-between font-mono font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            <span>Ingested Tokens:</span>
            <span className="text-red-600 dark:text-red-400">
              {formatNumber(currentTokens)} / {formatNumber(monthlyQuota)} ({activeTierName})
            </span>
          </div>

          <div className="w-full bg-red-200 dark:bg-red-950 h-2 rounded-full overflow-hidden">
            <div className="bg-red-600 dark:bg-red-500 h-full w-full" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#515154] dark:text-[#A1A1A6] pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#86868B]" />
              <span>Next 30-day reset:</span>
            </div>
            <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              {resetDateString} (in {daysRemaining} days)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#86868B] leading-relaxed relative z-10">
          Upgrade your subscription plan to unlock more tokens immediately, or wait for the automatic 30-day cycle reset.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          <button
            onClick={() => {
              openPlanUpgradeModal();
              setIsDismissed(true);
            }}
            className="flex-1 h-9 px-4 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(0,80,255,0.35)] flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <span>Upgrade Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => {
              resetTokenQuota();
              setIsDismissed(true);
            }}
            className="h-9 px-3.5 rounded-full bg-[#F5F5F7] dark:bg-[#242428] hover:bg-[#E5E5EA] dark:hover:bg-[#343438] text-[11px] font-semibold text-[#515154] dark:text-[#A1A1A6] transition-all flex items-center gap-1 shrink-0"
            title="Reset token quota to 0 for demo"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset (Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
