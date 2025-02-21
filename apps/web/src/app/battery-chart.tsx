"use client"

import { Area, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { time: "00:00", price: 45, charge: 2, discharge: 0, soc: 0.3 },
  { time: "01:00", price: 42, charge: 1.5, discharge: 0, soc: 0.4 },
  { time: "02:00", price: 38, charge: 2, discharge: 0, soc: 0.5 },
  { time: "03:00", price: 35, charge: 2, discharge: 0, soc: 0.6 },
  { time: "04:00", price: 32, charge: 1.5, discharge: 0, soc: 0.7 },
  { time: "05:00", price: 36, charge: 0, discharge: 1, soc: 0.65 },
  { time: "06:00", price: 48, charge: 0, discharge: 2, soc: 0.55 },
  { time: "07:00", price: 52, charge: 0, discharge: 2, soc: 0.45 },
  { time: "08:00", price: 55, charge: 0, discharge: 1.5, soc: 0.35 },
  // Add more data points as needed
]

export function BatteryOperationsChart({ optimizationResult, isLoading }: { optimizationResult: any, isLoading: boolean }) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
            }}
            labelStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
          <Line yAxisId="left" type="monotone" dataKey="price" stroke="hsl(var(--primary))" dot={false} />
          <Bar yAxisId="right" dataKey="charge" fill="hsl(var(--success))" opacity={0.8} />
          <Bar yAxisId="right" dataKey="discharge" fill="hsl(var(--destructive))" opacity={0.8} />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="soc"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--muted-foreground))"
            opacity={0.3}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

