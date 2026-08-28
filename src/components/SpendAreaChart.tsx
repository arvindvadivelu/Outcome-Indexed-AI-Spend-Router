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
  data: Array<{ day: string; baseline: number; actual: number; savings: number }>;
}

export function SpendAreaChart({ data }: SpendAreaChartProps) {
  return (
    <div className="h-64 sm:h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0050FF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0050FF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F2" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#86868B" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: "12px"
            }}
          />
          <Area type="monotone" dataKey="baseline" stroke="#D2D2D7" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
          <Area type="monotone" dataKey="actual" stroke="#0050FF" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
