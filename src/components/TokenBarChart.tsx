"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface TokenBarChartProps {
  data: Array<{ day: string; input: number; output: number; cached: number }>;
}

export function TokenBarChart({ data }: TokenBarChartProps) {
  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Bar dataKey="input" fill="#0050FF" radius={[4, 4, 0, 0]} stackId="a" />
          <Bar dataKey="output" fill="#80A8FF" radius={[4, 4, 0, 0]} stackId="a" />
          <Bar dataKey="cached" fill="#E5E5EA" radius={[4, 4, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
