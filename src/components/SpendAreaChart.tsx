"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface SpendAreaChartProps {
  data: Array<{ day: string; baseline: number; actual: number; savings: number; requests?: number }>;
  currencySymbol?: string;
  viewMode?: "spend" | "savings" | "volume";
}

export function SpendAreaChart({ data, currencySymbol = "$", viewMode = "spend" }: SpendAreaChartProps) {
  return (
    <div className="h-72 sm:h-96 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0050FF" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0050FF" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#86868B" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#86868B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.12)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#86868B" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => viewMode === "volume" ? `${val}` : `${currencySymbol}${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(22, 22, 24, 0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              fontSize: "12px",
              color: "#F5F5F7"
            }}
            formatter={(value: any, name: string) => {
              const numVal = typeof value === "number" && !isNaN(value) ? value : (Number(value) || 0);
              if (viewMode === "volume") return [`${Math.round(numVal).toLocaleString()} requests`, "Traffic Volume"];
              if (name === "savings") return [`+${currencySymbol}${numVal.toFixed(2)}`, "Avoided AI Spend (Saved)"];
              if (name === "actual") return [`${currencySymbol}${numVal.toFixed(2)}`, "Optimized AI Spend"];
              if (name === "baseline") return [`${currencySymbol}${numVal.toFixed(2)}`, "Raw Unrouted Cost"];
              return [numVal, name];
            }}
          />
          {viewMode === "spend" && (
            <>
              <Area type="monotone" dataKey="baseline" name="baseline" stroke="#86868B" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#baselineGradient)" />
              <Area type="monotone" dataKey="savings" name="savings" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#savingsGradient)" />
              <Area type="monotone" dataKey="actual" name="actual" stroke="#0050FF" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGradient)" />
            </>
          )}
          {viewMode === "savings" && (
            <Area type="monotone" dataKey="savings" name="savings" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#savingsGradient)" />
          )}
          {viewMode === "volume" && (
            <Area type="monotone" dataKey="requests" name="requests" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#volumeGradient)" />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
