"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function OverviewChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip cursor={{ fill: "transparent" }} />
        <Legend />
        <Bar dataKey="collections" fill="#10b981" radius={[4, 4, 0, 0]} name="Collections" />
        <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
