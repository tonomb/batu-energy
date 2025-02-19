  export interface OptimizationResult {
    daily_schedules: DayResult[];
    summary: OptimizationSummary;
  }
  export interface HourlySchedule {
    hour: number;
    action: 'charge' | 'discharge' | 'idle';
    power: number;
    price: number;
    soc: number;
  }

  export interface DayResult {
    date: string;
    schedule: HourlySchedule[];
    revenue: number;
    energy_charged: number;
    energy_discharged: number;
    avg_charge_price: number;
    avg_discharge_price: number;
  }

  export interface BestWorstDay {
    date: string;
    revenue: number;
  }

  export interface OptimizationSummary {
    total_revenue: number;
    avg_daily_revenue: number;
    best_day: BestWorstDay;
    worst_day: BestWorstDay;
  }
  
  