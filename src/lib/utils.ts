import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectUserRegionCurrency(): "USD" | "INR" {
  if (typeof window === "undefined") return "USD";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lowerTz = tz.toLowerCase();
    if (
      lowerTz.includes("calcutta") ||
      lowerTz.includes("kolkata") ||
      lowerTz.includes("delhi") ||
      lowerTz.includes("mumbai") ||
      lowerTz.includes("chennai") ||
      lowerTz.includes("india") ||
      lowerTz.includes("ist") ||
      lowerTz.includes("asia/colombo")
    ) {
      return "INR";
    }
    const languages = navigator.languages || [navigator.language];
    if (
      languages.some((l) => {
        const lower = l.toLowerCase();
        return lower.includes("-in") || lower.includes("hi") || lower.includes("ta") || lower.includes("te") || lower.includes("bn") || lower.includes("mr") || lower.includes("gu");
      })
    ) {
      return "INR";
    }
  } catch (e) {
    // Fallback to USD on error
  }
  return "USD";
}

export function formatCurrency(amount: number, currency: "USD" | "INR" = "USD"): string {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: amount < 1 ? 3 : 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount < 1 ? 4 : 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}
