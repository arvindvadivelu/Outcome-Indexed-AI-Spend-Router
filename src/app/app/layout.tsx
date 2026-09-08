"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { QuotaAlertNotification } from "@/components/QuotaAlertNotification";
import { SubscriptionPlanModal } from "@/components/SubscriptionPlanModal";
import { BudgetSetupModal } from "@/components/BudgetSetupModal";
import { useAppStore } from "@/lib/store";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage (one tick)
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
      const query = currentPath && currentPath !== "/app/dashboard" && currentPath !== "/app"
        ? `?redirectUrl=${encodeURIComponent(currentPath)}`
        : "";
      router.replace(`/auth/signin${query}`);
    }
  }, [hydrated, user, router]);

  // While checking auth, show nothing (prevents flash of protected content)
  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] flex items-center justify-center">
        <div className="text-xs text-[#86868B] animate-pulse">Authenticating...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col selection:bg-[#0050FF] selection:text-white" suppressHydrationWarning>
      <AppHeader />
      <div className="flex flex-1" suppressHydrationWarning>
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden p-6 sm:p-8 bg-[#FBFBFD] dark:bg-[#0A0A0C]" suppressHydrationWarning>
          <div className="mx-auto max-w-7xl" suppressHydrationWarning>{children}</div>
        </main>
      </div>
      <QuotaAlertNotification />
      <SubscriptionPlanModal />
      <BudgetSetupModal />
    </div>
  );
}
