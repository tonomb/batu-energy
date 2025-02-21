"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "2024-02-14", revenue: 2500, loss: -500 },
  { date: "2024-02-15", revenue: 3200, loss: -800 },
  { date: "2024-02-16", revenue: 2800, loss: -400 },
  { date: "2024-02-17", revenue: 3500, loss: -600 },
  { date: "2024-02-18", revenue: 2900, loss: -700 },
  { date: "2024-02-19", revenue: 3100, loss: -500 },
  { date: "2024-02-20", revenue: 3400, loss: -900 },
]

export function RevenueBreakdownChart({ optimizationResult, isLoading }: { optimizationResult: any, isLoading: boolean }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
            }}
            labelStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
          <Bar dataKey="revenue" fill="hsl(var(--success))" opacity={0.8} />
          <Bar dataKey="loss" fill="hsl(var(--destructive))" opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

