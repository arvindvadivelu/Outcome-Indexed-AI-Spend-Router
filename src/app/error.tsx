"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Boundary Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#0A0A0C] flex items-center justify-center p-6 text-[#1D1D1F] dark:text-[#F5F5F7]">
      <div className="max-w-md w-full rounded-[32px] bg-white/75 dark:bg-[#151518]/75 backdrop-blur-3xl border border-black/[0.06] dark:border-white/[0.08] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">Something unexpected happened</h1>
        <p className="text-sm text-[#86868B] mb-6 leading-relaxed">
          {error?.message || "An unexpected error occurred in the gateway runtime. Our self-healing systems have captured this event."}
        </p>

        {error?.digest && (
          <div className="mb-6 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] text-xs font-mono text-[#86868B] break-all">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0050FF] hover:bg-[#0043D6] text-white font-medium text-sm transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/app/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
