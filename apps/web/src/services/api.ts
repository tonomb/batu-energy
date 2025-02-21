import axios from 'axios';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Add logging to check environment variables
console.log('API URLs:', {
  API_URL
});

if (!API_URL) {
  throw new Error('Missing environment variables');
}

export interface BatteryParams {
  capacity_mw: number;
  duration_hours: number;
  efficiency: number;
  min_soc: number;
  max_soc: number;
}

export interface MarketParams {
  load_zone_id: string;
  date_start: string;
  date_end: string;
}

export interface OptimizationResult {
  daily_schedules: Array<{
    date: string;
    schedule: Array<{
      hour: number;
      action: 'charge' | 'discharge' | 'idle';
      power: number;
      price: number;
      soc: number;
    }>;
    revenue: number;
    energy_charged: number;
    energy_discharged: number;
    avg_charge_price: number;
    avg_discharge_price: number;
  }>;
  summary: OptimizationSummary;
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
  total_cycles: number;
  avg_cycle_revenue: number;
  avg_arbitrage_spread: number;
}

export interface MarketData {
  status: string;
  items: number;
  data: Array<{
    load_zone_id: string;
    timestamp: string;
    date: string;
    hour: string;
    pml: number;
    pml_cng: number;
    pml_ene: number;
    pml_per: number;
  }>;
}

export const api = {
  async optimize(batteryParams: BatteryParams, marketParams: MarketParams): Promise<OptimizationResult> {
    try {
      console.log('Making optimization request to:', `${API_URL}/optimize`);
      console.log('Request payload:', {
        battery_params: batteryParams,
        market_params: marketParams,
      });
      
      const response = await axios.post(`${API_URL}/optimize`, {
        battery_params: batteryParams,
        market_params: marketParams,
      });
      return response.data;
    } catch (error : any) {
      // Enhanced error logging
      console.error('Optimization request failed:', error);
      throw error;
    }
  },

  async getMarketData(zone: string, startDate: Date, endDate: Date): Promise<MarketData> {
    const response = await axios.post(`${API_URL}/market-data`, {
        zone: zone,
        start_date: format(startDate, 'yyyy-MM-dd HH:mm:ss'),
        end_date: format(endDate, 'yyyy-MM-dd HH:mm:ss'),
    });
    return response.data;
  },
}; 