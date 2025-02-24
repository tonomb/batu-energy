"use client"

import { useState } from "react"
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Bar } from "recharts"
import { MarketData, OptimizationResult } from "../services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface BatteryOperationsChartProps {
  optimizationResult?: OptimizationResult | null;
  marketData?: MarketData | null;
  isLoading: boolean;
}

export function BatteryOperationsChart({ optimizationResult, marketData, isLoading }: BatteryOperationsChartProps) {
  const [selectedDay, setSelectedDay] = useState<string>(optimizationResult?.daily_schedules[0]?.date || "");

  // Update selected day when optimization result changes
  if (optimizationResult?.daily_schedules[0]?.date && !selectedDay) {
    setSelectedDay(optimizationResult.daily_schedules[0].date);
  }

  const selectedSchedule = optimizationResult?.daily_schedules.find(
    schedule => schedule.date === selectedDay
  );

  // Transform the data for the chart
  const chartData = selectedSchedule?.schedule.map(point => {
    // Extract hour from market data timestamp (format: "2024-01-02 15:00:00")
    const marketPoint = marketData?.data.find(m => {
      const marketHour = new Date(m.timestamp).getHours();
      return m.date === selectedDay && marketHour === point.hour;
    });
    
    return {
      time: point.hour,
      price: point.price,
      charge: point.action === 'charge' ? point.power : 0,
      discharge: point.action === 'discharge' ? -point.power : 0,
      marketPrice: marketPoint ? marketPoint.pml_ene + marketPoint.pml_cng + marketPoint.pml_per : 0,
    };
  }) || [];

  console.log('Optimization result:', optimizationResult);
  console.log('Chart data:', {
    firstDay: optimizationResult?.daily_schedules[0]?.date,
    marketDataPoints: marketData?.data.length,
    chartDataPoints: chartData.length,
    samplePoint: chartData[0],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Select Day:</span>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {optimizationResult?.daily_schedules.map(schedule => (
                <SelectItem key={schedule.date} value={schedule.date}>
                  {format(new Date(schedule.date), "MMM d, yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedSchedule && (
          <div className="text-sm text-muted-foreground">
            Daily Revenue: ${selectedSchedule.revenue.toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              tickFormatter={(hour) => `${hour}:00`}
            />
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
              label={{ value: 'Power (MW)', angle: 90, position: 'insideRight' }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
              labelStyle={{
                color: "hsl(var(--foreground))",
              }}
              labelFormatter={(hour) => `${hour}:00`}
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              dot={false}
              name="Optimized Price"
            />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="marketPrice" 
              stroke="hsl(var(--muted-foreground))" 
              dot={false}
              name="Market Price"
              strokeDasharray="3 3"
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
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

