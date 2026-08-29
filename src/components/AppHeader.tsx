"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Search,
  Play,
  User,
  CreditCard,
  Settings as SettingsIcon,
  Key,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
  Shield,
  X,
  Lock,
  Globe,
  Home
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { SimulateRequestModal } from "./SimulateRequestModal";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  const router = useRouter();
  const {
    currency,
    toggleCurrency,
    monthlySpendUSD,
    baselineSpendUSD,
    user,
    updateUserProfile,
    logout,
    planTier,
    orgName
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || "Alex Vance");
  const [editEmail, setEditEmail] = useState(user?.email || "alex@company.com");
  const [editPin, setEditPin] = useState("123456");
  const [profileSaved, setProfileSaved] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCurrency = mounted ? currency : "USD";
  const rate = activeCurrency === "INR" ? 86.5 : 1;
  const currentSpend = monthlySpendUSD * rate;
  const baselineSpend = baselineSpendUSD * rate;
  const savedAmount = baselineSpend > currentSpend ? baselineSpend - currentSpend : 0;
  const savedPercent = baselineSpend > 0 ? Math.round((savedAmount / baselineSpend) * 100) : 0;

  const userName = mounted && user?.name ? user.name : "Alex Vance";
  const userEmail = mounted && user?.email ? user.email : "alex@company.com";
  const activePlan = mounted && planTier ? planTier : "free";

  // Derive initials
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AR";

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(editName.trim(), editEmail.trim());
    setProfileSaved(true);
    setTimeout(() => {
      setProfileSaved(false);
      setShowEditProfileModal(false);
    }, 1200);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-black/[0.05] dark:border-white/[0.08] bg-white/80 dark:bg-[#161618]/80 backdrop-blur-xl flex items-center justify-between px-6" suppressHydrationWarning>
        {/* Left: Night Mode Toggle & Quick Search */}
        <div className="flex items-center gap-3" suppressHydrationWarning>
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

        {/* Right: Home Button, Net Savings Pill, Simulate Button, Avatar Dropdown */}
        <div className="flex items-center gap-3" suppressHydrationWarning>
          {/* Home Button linking to Landing Page http://localhost:3000/ */}
          <Link
            href="/"
            className="h-9 w-9 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] border border-black/[0.04] dark:border-white/[0.08] text-[#515154] dark:text-[#A1A1A6] hover:text-[#0050FF] dark:hover:text-[#3374FF] hover:bg-white dark:hover:bg-[#252528] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-2xs"
            title="Go to Home Page (http://localhost:3000/)"
          >
            <Home className="h-4 w-4" />
          </Link>

          {/* Dynamic Real-Time Net Savings Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1F1F23] text-xs" suppressHydrationWarning>
            <span className="text-[#86868B] font-medium">Saved:</span>
            <span className="font-semibold text-[#0050FF] dark:text-[#3374FF]">
              +{formatCurrency(savedAmount, activeCurrency)}
            </span>
            <span className="text-[11px] text-[#0050FF] dark:text-[#3374FF] font-medium">
              (-{savedPercent}%)
            </span>
          </div>

          {/* Simulate Action Button */}
          <button
            onClick={() => setShowSimulate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0050FF] text-white text-xs font-semibold hover:bg-[#0043D6] shadow-sm shadow-[#0050FF]/25 transition-all hover:scale-[1.02]"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Simulate Request</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative pl-2 border-l border-black/[0.06] dark:border-white/[0.08]" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all focus:outline-none"
              title="User Account Menu"
              aria-expanded={dropdownOpen}
            >
              <div className="h-8 w-8 rounded-full bg-[#1D1D1F] dark:bg-[#2C2C30] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-transparent hover:ring-[#0050FF]/40 transition-all">
                {initials}
              </div>
              <ChevronDown className="h-3 w-3 text-[#86868B] hidden sm:block" />
            </button>

            {/* Dropdown Floating Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-[24px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-3 text-xs space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="p-3 rounded-2xl bg-[#F7F7F9] dark:bg-[#252528] space-y-1.5 border border-black/[0.03] dark:border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                      {userName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF4FF] dark:bg-[#0050FF]/20 text-[#0050FF] dark:text-[#3374FF] capitalize">
                      {activePlan}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868B] truncate">{userEmail}</p>
                </div>

                {/* Plan Status Banner */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#0050FF]/10 to-indigo-500/10 border border-[#0050FF]/15">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#0050FF] dark:text-[#3374FF]" />
                    <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Plan: {activePlan.toUpperCase()}</span>
                  </div>
                  <Link
                    href="/app/billing"
                    onClick={() => setDropdownOpen(false)}
                    className="text-[11px] font-bold text-[#0050FF] dark:text-[#3374FF] hover:underline"
                  >
                    Upgrade
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowEditProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium transition-colors text-left"
                  >
                    <User className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>Edit Profile & Credentials</span>
                  </button>

                  <Link
                    href="/app/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium transition-colors"
                  >
                    <SettingsIcon className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>Workspace Settings</span>
                  </Link>

                  <Link
                    href="/app/settings/api-keys"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium transition-colors"
                  >
                    <Key className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>API Keys & Credentials</span>
                  </Link>

                  <Link
                    href="/app/billing"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-[#86868B]" />
                    <span>Billing, Plans & Quotas</span>
                  </Link>

                  {/* Currency Quick Toggle */}
                  <button
                    onClick={() => {
                      toggleCurrency();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="h-3.5 w-3.5 text-[#86868B]" />
                      <span>Currency: {activeCurrency}</span>
                    </div>
                    <span className="font-mono font-bold text-[#0050FF] dark:text-[#3374FF]">
                      {activeCurrency === "USD" ? "$ USD" : "₹ INR"}
                    </span>
                  </button>
                </div>

                {/* Sign Out Action */}
                <div className="pt-1 border-t border-black/[0.05] dark:border-white/[0.08]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-2">
                <User className="h-4 w-4 text-[#0050FF]" />
                <span>Edit Profile & Passkey</span>
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="h-8 w-8 rounded-full bg-[#F5F5F7] dark:bg-[#242428] flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">Work Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#86868B]">6-Digit Security PIN (Passkey Backup)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  className="w-full h-11 px-4 rounded-full bg-[#F7F7F9] dark:bg-[#1E1E22] border border-black/[0.06] dark:border-white/[0.08] font-mono text-center tracking-widest text-xs text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none"
                />
              </div>

              {profileSaved && (
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-5 h-11 rounded-full bg-[#F5F5F7] dark:bg-[#242428] font-semibold text-xs text-[#515154] dark:text-[#A1A1A6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 h-11 rounded-full bg-[#0050FF] text-white font-semibold text-xs hover:bg-[#0043D6] shadow-[0_4px_14px_rgba(0,80,255,0.3)] transition-all flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      {showSimulate && <SimulateRequestModal onClose={() => setShowSimulate(false)} />}
    </>
  );
}
