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

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Night Mode"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
      className={`inline-flex items-center justify-center h-8 w-8 rounded-full border border-black/[0.06] dark:border-white/[0.1] bg-[#F5F5F7] dark:bg-[#1E1E22] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#EBEBEF] dark:hover:bg-[#2A2A30] transition-all ${className}`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-[#515154]" />
      ) : (
        <Sun className="h-4 w-4 text-[#FFD60A]" />
      )}
    </button>
  );
}
