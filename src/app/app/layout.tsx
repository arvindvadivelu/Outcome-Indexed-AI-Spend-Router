import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { QuotaAlertNotification } from "@/components/QuotaAlertNotification";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    </div>
  );
}
