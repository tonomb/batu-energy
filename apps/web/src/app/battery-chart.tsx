"use client"

import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Bar, Area } from "recharts"
import { OptimizationResult } from "../services/api"

interface BatteryOperationsChartProps {
  optimizationResult?: OptimizationResult | null;
  isLoading: boolean;
}

export function BatteryOperationsChart({ optimizationResult, isLoading }: BatteryOperationsChartProps) {
  // Transform the data for the chart
  const chartData = optimizationResult?.daily_schedules[0]?.schedule.map(point => ({
    time: point.hour,
    price: point.price,
    charge: point.action === 'charge' ? point.power : 0,
    discharge: point.action === 'discharge' ? -point.power : 0,
    soc: point.soc * 100, // Convert to percentage
  })) || [];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="time" />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="hsl(var(--primary))"
            label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft' }} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="hsl(var(--muted-foreground))"
            label={{ value: 'Power (MW) / SOC (%)', angle: 90, position: 'insideRight' }} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
            }}
            labelStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            dot={false}
            name="Price"
          />
          <Bar 
            yAxisId="right" 
            dataKey="charge" 
            fill="hsl(var(--success))" 
            opacity={0.8}
            name="Charging"
          />
          <Bar 
            yAxisId="right" 
            dataKey="discharge" 
            fill="hsl(var(--destructive))" 
            opacity={0.8}
            name="Discharging"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="soc"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--muted-foreground))"
            opacity={0.3}
            name="State of Charge"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

