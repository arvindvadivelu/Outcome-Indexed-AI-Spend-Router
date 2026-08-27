"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Navbar() {
  const pathname = usePathname();
  const { currency, toggleCurrency } = useAppStore();

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/case-studies", label: "Case Studies" },
    { href: "/docs", label: "Docs" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0050FF] shadow-md shadow-[#0050FF]/25 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#1D1D1F] text-base leading-tight tracking-tight flex items-center gap-1.5">
              OutcomeRouter
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#0050FF] font-bold border border-[#0050FF]/20">
                v1.0
              </span>
            </span>
            <span className="text-[11px] text-[#86868B] font-medium">Outcome-Indexed AI Spend</span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#0050FF] ${
                  isActive ? "text-[#0050FF] font-semibold" : "text-[#515154]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-[#515154] hover:text-[#1D1D1F] hover:border-[#D2D2D7] transition-all"
            title="Toggle between USD ($) and INR (₹)"
          >
            <span className={currency === "USD" ? "text-[#0050FF] font-bold" : "text-[#86868B]"}>USD $</span>
            <span className="text-[#D2D2D7]">/</span>
            <span className={currency === "INR" ? "text-[#0050FF] font-bold" : "text-[#86868B]"}>INR ₹</span>
          </button>

          <Link
            href="/auth/signin"
            className="hidden sm:inline-flex text-sm font-medium text-[#515154] hover:text-[#1D1D1F] px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0050FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0040CC] transition-all shadow-sm shadow-[#0050FF]/20 hover:scale-[1.02]"
          >
            <span>Open Console</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
