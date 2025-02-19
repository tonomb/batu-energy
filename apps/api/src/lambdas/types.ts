import { RequestSchema, BatteryParamsSchema, MarketParamsSchema } from "./schema";
import { z } from 'zod';

export type RequestBody = z.infer<typeof RequestSchema>;
export type BatteryParams = z.infer<typeof BatteryParamsSchema>;
export type MarketParams = z.infer<typeof MarketParamsSchema>;

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

  export interface BatuEnergyApiResponse {
    status: string;
    items: number
    data: {
      load_zone_id: string;
      timestamp: string;
      date: string;
      hour: string;
      pml: number;
      pml_cng: number;
      pml_ene: number;
      pml_per: number;
    }[]
  }
  
  