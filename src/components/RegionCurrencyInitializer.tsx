"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { detectUserRegionCurrency } from "@/lib/utils";

export function RegionCurrencyInitializer() {
  const { setCurrency } = useAppStore();

  useEffect(() => {
    // Detect region currency once on client mount
    const detected = detectUserRegionCurrency();
    const stored = localStorage.getItem("outcome-router-currency-preference");
    if (!stored) {
      setCurrency(detected);
    }
  }, [setCurrency]);

  return null;
}
