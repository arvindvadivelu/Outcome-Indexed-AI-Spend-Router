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
    { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/routing", label: "Routing Rules", icon: GitFork },
    { href: "/app/benchmarks", label: "Benchmarks", icon: BarChart3 },
    { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/app/analytics/tokens", label: "Token Analytics", icon: Coins },
    { href: "/app/logs", label: "Audit Logs", icon: ScrollText },
    { href: "/app/settings/api-keys", label: "API Keys", icon: Key },
    { href: "/app/billing", label: "Billing & Plans", icon: CreditCard },
    { href: "/app/team", label: "Team Members", icon: Users },
    { href: "/app/integrations", label: "Integrations", icon: Blocks },
    { href: "/app/webhooks", label: "Webhooks", icon: Webhook },
  ];

  const quotaPct = Math.min(100, Math.round((currentTokens / monthlyQuota) * 100));

  return (
    <aside className="w-64 flex-shrink-0 border-r border-black/[0.05] bg-[#FBFBFD] flex flex-col justify-between min-h-[calc(100vh-4rem)] select-none">
      <div className="p-4 space-y-6">
        {/* Workspace Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-black/[0.04] shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-[#0050FF] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#0050FF]/20">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F] truncate">{orgName}</p>
              <span className="text-[10px] text-[#86868B] font-medium capitalize">
                {planTier} Plan
              </span>
            </div>
          </div>
          <button
            onClick={toggleCurrency}
            className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#F5F5F7] text-[#515154] hover:text-[#0050FF] hover:bg-[#EEF4FF] transition-colors"
            title="Switch Currency"
          >
            {currency}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-medium text-[#86868B] tracking-wider uppercase">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#0050FF] text-white font-semibold shadow-sm shadow-[#0050FF]/25"
                    : "text-[#515154] hover:text-[#1D1D1F] hover:bg-black/[0.03]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#86868B]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Token Quota Meter & Docs */}
      <div className="p-4 border-t border-black/[0.04] space-y-3">
        <div className="p-3.5 rounded-2xl bg-white border border-black/[0.04] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#86868B] font-medium">Monthly Tokens</span>
            <span className="font-semibold text-[#1D1D1F]">{quotaPct}%</span>
          </div>
          <div className="w-full bg-[#F5F5F7] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0050FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${quotaPct}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#86868B]">
            <span>{formatNumber(currentTokens)}</span>
            <span>{formatNumber(monthlyQuota)} max</span>
          </div>
        </div>

        <Link
          href="/docs"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-white hover:bg-black/[0.02] border border-black/[0.04] text-[#515154] hover:text-[#1D1D1F] text-xs transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#0050FF]" />
            <span className="font-medium">Documentation</span>
          </div>
          <ExternalLink className="h-3 w-3 text-[#86868B]" />
        </Link>
      </div>
    </aside>
  );
}
