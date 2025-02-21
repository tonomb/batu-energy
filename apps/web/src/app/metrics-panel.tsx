import { Battery, DollarSign, Gauge, TrendingUp } from "lucide-react"

export interface BestWorstDay {
  date: string;
  revenue: number;
}
export interface OptimizationSummary {
  total_revenue: number;
  avg_daily_revenue: number;
  best_day: BestWorstDay;
  worst_day: BestWorstDay;
  total_cycles: number;
  avg_cycle_revenue: number;
  avg_arbitrage_spread: number;
}

export function MetricsPanel({ summary, isLoading }: { summary?: OptimizationSummary, isLoading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="rounded-full bg-primary/10 p-2">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">${summary?.total_revenue.toLocaleString() || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="rounded-full bg-primary/10 p-2">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
          <p className="text-2xl font-bold">${summary?.avg_daily_revenue.toLocaleString() || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="rounded-full bg-primary/10 p-2">
          <Battery className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Cycles Used</p>
          <p className="text-2xl font-bold">{summary?.total_cycles || 0}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="rounded-full bg-primary/10 p-2">
          <Gauge className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Avg Cycle Revenue</p>
          <p className="text-2xl font-bold">${summary?.avg_cycle_revenue.toLocaleString() || 0}</p>
        </div>
      </div>
    </div>
  )
}

