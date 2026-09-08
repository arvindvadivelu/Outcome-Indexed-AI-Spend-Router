"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Sliders, Shield, Zap, Check, X, Sparkles, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function BudgetSetupModal() {
  const {
    isBudgetSetupModalOpen,
    closeBudgetSetupModal,
    hasConfiguredBudget,
    setHasConfiguredBudget,
    autopilot,
    setMonthlyBudget,
    setAutopilotMode,
    currency,
    setCurrency,
    user
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">(currency || "USD");
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [strategy, setStrategy] = useState<"optimal_pace" | "aggressive_savings" | "quality_boost">("optimal_pace");
  const [alertThreshold, setAlertThreshold] = useState<number>(85);
  const [autoThrottle, setAutoThrottle] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const curr = currency || "USD";
    setSelectedCurrency(curr);
    if (autopilot.monthly_budget_usd && autopilot.monthly_budget_usd > 0) {
      const displayVal = curr === "INR" ? Math.round(autopilot.monthly_budget_usd * 86.5) : Math.round(autopilot.monthly_budget_usd);
      setBudgetInput(String(displayVal));
    } else {
      setBudgetInput(curr === "INR" ? "125000" : "1500");
    }
    if (autopilot.mode) {
      setStrategy(autopilot.mode as any);
    }
  }, [autopilot, currency, isBudgetSetupModalOpen]);

  if (!mounted || !isBudgetSetupModalOpen) return null;

  const currencySymbol = selectedCurrency === "INR" ? "₹" : "$";
  const numBudget = parseFloat(budgetInput) || 0;

  const handleCurrencySwitch = (newCurr: "USD" | "INR") => {
    if (newCurr === selectedCurrency) return;
    setSelectedCurrency(newCurr);
    setCurrency(newCurr);
    if (newCurr === "INR") {
      setBudgetInput("125000");
    } else {
      setBudgetInput("1500");
    }
  };

  const handlePresetSelect = (val: number) => {
    setBudgetInput(String(val));
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numBudget <= 0) return;

    setSaving(true);
    const budgetUsd = selectedCurrency === "INR" ? numBudget / 86.5 : numBudget;
    setMonthlyBudget(budgetUsd);
    setAutopilotMode(strategy);
    setCurrency(selectedCurrency);
    setHasConfiguredBudget(true);

    if (user?.email) {
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            monthlyBudgetUSD: budgetUsd,
            autopilotMode: strategy,
            currency: selectedCurrency,
            hasConfiguredBudget: true
          })
        });
      } catch {}
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSaving(false);
      closeBudgetSetupModal();
    }, 800);
  };

  const usdPresets = [500, 1500, 5000, 10000];
  const inrPresets = [40000, 125000, 400000, 800000];
  const activePresets = selectedCurrency === "INR" ? inrPresets : usdPresets;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#161618] text-[#1D1D1F] dark:text-[#F5F5F7] border border-black/[0.08] dark:border-white/[0.1] rounded-[36px] p-6 sm:p-9 max-w-lg w-full shadow-2xl space-y-6 my-8 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] text-xs font-semibold mb-1">
              <Sliders className="h-3.5 w-3.5" />
              <span>Mandatory Gateway FinOps Configuration</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Monthly Budget Ceiling &amp; Pacing
            </h2>
            <p className="text-xs text-[#86868B]">
              Establish your target spending threshold and autonomous auto-pilot pacing strategy before routing live LLM tokens.
            </p>
          </div>
          {hasConfiguredBudget && (
            <button
              onClick={closeBudgetSetupModal}
              className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="h-4 w-4" />
            <span>Budget ceiling initialized and active!</span>
          </div>
        )}

        <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
          {/* Currency Selection Toggle */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Billing Currency</span>
              <div className="inline-flex p-1 rounded-full bg-[#E5E5EA]/70 dark:bg-[#2A2A2E]/70 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleCurrencySwitch("USD")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    selectedCurrency === "USD"
                      ? "bg-white dark:bg-[#343438] text-[#0050FF] dark:text-[#3374FF] shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencySwitch("INR")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    selectedCurrency === "INR"
                      ? "bg-white dark:bg-[#343438] text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                  }`}
                >
                  INR (₹)
                </button>
              </div>
            </div>
          </div>

          {/* Budget Ceiling Input with zero-deletion fix & Quick Presets */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08]">
            <label className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-between">
              <span>Monthly Budget Ceiling ({selectedCurrency})</span>
              <span className="text-[11px] font-mono text-[#0050FF] font-semibold">
                {currencySymbol}{numBudget > 0 ? numBudget.toLocaleString() : "0"} / month
              </span>
            </label>
            <div className="relative flex items-center mt-1.5">
              <span className="absolute left-4 font-bold font-mono text-sm text-[#86868B]">{currencySymbol}</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={budgetInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setBudgetInput(val);
                }}
                placeholder={selectedCurrency === "INR" ? "125000" : "1500"}
                className="w-full h-11 pl-8 pr-4 rounded-xl bg-white dark:bg-[#252528] border border-black/[0.08] dark:border-white/[0.1] font-mono font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0050FF]"
              />
            </div>

            {/* Quick Preset Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-[#86868B] font-medium mr-1">Presets:</span>
              {activePresets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handlePresetSelect(val)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition-all ${
                    numBudget === val
                      ? "bg-[#0050FF] text-white shadow-2xs"
                      : "bg-white dark:bg-[#2C2C30] border border-black/[0.06] dark:border-white/[0.08] text-[#515154] dark:text-[#A1A1A6] hover:border-[#0050FF]/40"
                  }`}
                >
                  {currencySymbol}{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Autopilot Strategy Mode */}
          <div className="space-y-2">
            <label className="font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Autonomous Pacing Strategy</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "optimal_pace", label: "Optimal Pace", sub: "Balanced 70% Quality / 25% Cost" },
                { id: "aggressive_savings", label: "Aggressive", sub: "Max 50% Quality / 40% Cost" },
                { id: "quality_boost", label: "Quality Boost", sub: "Max 85% Quality / 15% Cost" }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStrategy(item.id as any)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    strategy === item.id
                      ? "bg-[#EEF4FF] dark:bg-[#0050FF]/20 border-[#0050FF] text-[#0050FF] dark:text-[#3374FF] font-bold shadow-xs"
                      : "bg-[#F7F7F9] dark:bg-[#1E1E22] border-black/[0.04] dark:border-white/[0.06] text-[#515154] dark:text-[#A1A1A6]"
                  }`}
                >
                  <span className="block text-xs">{item.label}</span>
                  <span className="text-[9px] font-normal opacity-80 leading-tight block mt-0.5">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#86868B]">Pacing Alert Threshold:</span>
              <span className="font-bold font-mono text-[#0050FF]">{alertThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
              className="w-full accent-[#0050FF] h-2 bg-[#E5E5EA] dark:bg-[#2C2C2E] rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-[#86868B] block">Triggers instant webhook and email alerts when spend pacing reaches {alertThreshold}% of ceiling.</span>
          </div>

          {/* Auto-Throttle Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.04] dark:border-white/[0.06]">
            <div className="space-y-0.5">
              <span className="font-bold text-xs">Auto-Throttle on Ceiling Breach</span>
              <p className="text-[10px] text-[#86868B]">Automatically downgrade non-critical tasks to sub-cent models when ceiling is reached</p>
            </div>
            <input
              type="checkbox"
              checked={autoThrottle}
              onChange={(e) => setAutoThrottle(e.target.checked)}
              className="h-4 w-4 accent-[#0050FF] rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={saving || numBudget <= 0}
            className="w-full h-12 rounded-full bg-[#0050FF] hover:bg-[#0043D6] text-white font-bold text-xs transition-all shadow-[0_6px_20px_rgba(0,80,255,0.35)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Activating Budget Gateway...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-current" />
                <span>Save &amp; Initialize Budget Ceiling ({selectedCurrency})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
