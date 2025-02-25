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
import { MetricsPanel } from "./metrics-panel"
import { BatteryParamsForm } from "./battery-params-form"

const DEFAULT_BATTERY_PARAMS: BatteryParams = {
  capacity_mw: 10,
  duration_hours: 4,
  efficiency: 0.85,
  min_soc: 0.1,
  max_soc: 1.0,
};

// TODO: Add all nodes API endpoint
const nodes = ['APATZINGAN', 'CANCUN','MONTERREY', 'MERIDA', 'PUEBLA',  'OBREGON'];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date('2024-01-02'),
    to: addDays(new Date('2024-01-02'), 30)
  });
  const [selectedZone, setSelectedZone] = useState(nodes[0])
  const [batteryParams, setBatteryParams] = useState<BatteryParams>(DEFAULT_BATTERY_PARAMS);

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
      batteryParams,
      {
        load_zone_id: selectedZone,
        date_start: format(dateRange.from, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        date_end: format(dateRange.to, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
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
      dateRange.from,
      dateRange.to
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
  }, [selectedZone, dateRange.from, dateRange.to]);

  // Log mutation state changes
  console.log('Mutation status:', {
    status,
    isLoading,
    hasData: !!optimizationResult,
    error: error,
    selectedZone,
    dateRange: {
      from: format(dateRange.from, "yyyy-MM-dd"),
      to: format(dateRange.to, "yyyy-MM-dd")
    }
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
                {nodes.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
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

        <div className="grid grid-cols-2 gap-6">
          
          <BatteryParamsForm 
              defaultParams={DEFAULT_BATTERY_PARAMS}
              onChange={setBatteryParams}
            />
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

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market & Battery Operations</CardTitle>
              <CardDescription>Visualize Daily Market Prices and Battery Charge/Discharge Actions</CardDescription>
            </CardHeader>
            <CardContent>
              <BatteryOperationsChart 
                optimizationResult={optimizationResult}
                marketData={marketData}
                isLoading={isLoading || isLoadingMarketData}
              />
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  )
}

