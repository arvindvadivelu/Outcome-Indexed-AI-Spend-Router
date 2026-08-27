"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitFork,
  BarChart3,
  Coins,
  Key,
  CreditCard,
  Users,
  Blocks,
  Webhook,
  ScrollText,
  Zap,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { orgName, planTier, monthlyQuota, currentTokens, currency, toggleCurrency } = useAppStore();

  const navItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { href: "/app/routing", label: "Routing Rules", icon: GitFork, badge: "Live" },
    { href: "/app/benchmarks", label: "Outcome Benchmarks", icon: BarChart3, badge: "A/B" },
    { href: "/app/analytics/tokens", label: "Token Analytics", icon: Coins, badge: "-42%" },
    { href: "/app/logs", label: "Audit Logs", icon: ScrollText, badge: null },
    { href: "/app/settings/api-keys", label: "API Keys", icon: Key, badge: null },
    { href: "/app/billing", label: "Billing & Plans", icon: CreditCard, badge: null },
    { href: "/app/team", label: "Team Members", icon: Users, badge: null },
    { href: "/app/integrations", label: "Integrations", icon: Blocks, badge: "6 Active" },
    { href: "/app/webhooks", label: "Webhooks", icon: Webhook, badge: null },
  ];

  const quotaPct = Math.round((currentTokens / monthlyQuota) * 100);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-black/[0.06] bg-[#F5F5F7]/80 backdrop-blur-xl flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Org Selector */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-black/[0.06] shadow-apple-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-[#0050FF]/10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-[#0050FF]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F] truncate">{orgName}</p>
              <span className="text-[10px] font-mono text-[#0050FF] font-bold uppercase tracking-wide">
                {planTier} Plan
              </span>
            </div>
          </div>
          <button
            onClick={toggleCurrency}
            className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-[#F5F5F7] border border-[#E5E5EA] text-[#515154] hover:text-[#0050FF] transition-colors"
            title="Toggle currency"
          >
            {currency}
          </button>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase text-[#86868B] tracking-wider font-mono">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#0050FF] text-white font-semibold shadow-sm shadow-[#0050FF]/25"
                    : "text-[#515154] hover:text-[#1D1D1F] hover:bg-white/80"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#86868B]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "bg-white text-[#515154] border border-[#E5E5EA]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Monthly Quota & Spend Widget */}
      <div className="p-4 border-t border-black/[0.06] space-y-3">
        <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-apple-sm space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#86868B] font-medium">Monthly Token Quota</span>
            <span className="font-mono text-[#0050FF] font-bold">{quotaPct}%</span>
          </div>
          <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0050FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${quotaPct}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#86868B] font-mono">
            <span>{formatNumber(currentTokens)}</span>
            <span>/ {formatNumber(monthlyQuota)}</span>
          </div>
        </div>

        <Link
          href="/docs"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-white/90 border border-black/[0.06] text-[#515154] hover:text-[#1D1D1F] text-xs transition-colors shadow-apple-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#0050FF]" />
            <span className="font-medium">API Reference</span>
          </div>
          <ExternalLink className="h-3 w-3 text-[#86868B]" />
        </Link>
      </div>
    </aside>
  );
}
