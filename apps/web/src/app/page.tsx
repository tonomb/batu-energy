"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api, BatteryParams } from "../services/api"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BatteryOperationsChart } from "./battery-chart"
import { RevenueBreakdownChart } from "./revenue-breakdown-chart"
import { MetricsPanel } from "./metrics-panel"

const DEFAULT_BATTERY_PARAMS: BatteryParams = {
  capacity_mw: 10,
  duration_hours: 4,
  efficiency: 0.85,
  min_soc: 0.1,
  max_soc: 1.0,
};

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date('2024-01-02'))
  const [selectedZone, setSelectedZone] = useState("APATZINGAN")

  // Optimization mutation
  const { 
    mutate: runOptimization, 
    data: optimizationResult, 
    isPending: isLoading,
    error,
    status
  } = useMutation({
    mutationKey: ['optimize'],
    mutationFn: () => api.optimize(
      DEFAULT_BATTERY_PARAMS,
      {
        load_zone_id: selectedZone,
        date_start: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        date_end: format(addDays(date, 30), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      }
    ),
  });

  // Run optimization on component mount
  useEffect(() => {
    runOptimization();
  }, []);

  const { 
    mutate: fetchMarketData, 
    data: marketData, 
    isPending: isLoadingMarketData,
    error: marketDataError,
    status: marketDataStatus
  } = useMutation({
    mutationKey: ['market-data'],
    mutationFn: () => api.getMarketData(
      selectedZone,
      date,
      addDays(date, 30)
    ),
    onSuccess: (data) => {
      console.log('Market data fetch succeeded:', data);
    },
    onError: (error) => {
      console.error('Market data fetch failed:', error);
    }
  });

  // Run both operations when zone or date changes
  useEffect(() => {
    runOptimization();
    fetchMarketData();
  }, [selectedZone, date]); // Add dependencies to re-run when these change

  // Log mutation state changes
  console.log('Mutation status:', {
    status,
    isLoading,
    hasData: !!optimizationResult,
    error: error,
    selectedZone,
    date: format(date, "yyyy-MM-dd")
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Battery Storage Arbitrage Optimizer</h1>
            <p className="text-muted-foreground">Monitor and optimize battery charging/discharging patterns</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APATZINGAN">APATZINGAN</SelectItem>
                <SelectItem value="GUADALAJARA">GUADALAJARA</SelectItem>
                <SelectItem value="MEXICALI">MEXICALI</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
            <Button 
              onClick={() => runOptimization()} 
              disabled={isLoading}
            >
              {isLoading ? "Optimizing..." : "Run Optimization"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market & Battery Operations</CardTitle>
              <CardDescription>Visualize market prices and battery charge/discharge actions</CardDescription>
            </CardHeader>
            <CardContent>
              <BatteryOperationsChart 
                optimizationResult={optimizationResult}
                marketData={marketData}
                isLoading={isLoading || isLoadingMarketData}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricsPanel 
                  summary={optimizationResult?.summary}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

