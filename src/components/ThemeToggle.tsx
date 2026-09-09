"use client";

import { useAppStore } from "@/lib/store";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle Night Mode"
        tabIndex={-1}
        className={`inline-flex items-center justify-center h-8 w-8 rounded-full border border-black/[0.06] dark:border-white/[0.1] bg-[#F5F5F7] dark:bg-[#1E1E22] text-[#515154] ${className}`}
      >
        <Moon className="h-4 w-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Night Mode"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full border border-black/[0.06] dark:border-white/[0.1] bg-[#F5F5F7] dark:bg-[#1E1E22] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBEF] dark:hover:bg-[#2A2A30] transition-all ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#FFD60A]" />
      ) : (
        <Moon className="h-4 w-4 text-[#515154]" />
      )}
    </button>
  );
}
