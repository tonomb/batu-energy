export interface BatteryParams {
    capacity_mw: number;
    duration_hours: number;
    efficiency: number;
    min_soc: number;
    max_soc: number;
  }
  
  export interface MarketParams {
    zone: string;
    start_date: string;
    end_date: string;
  }
  
  export interface RequestBody {
    battery_params: BatteryParams;
    market_params: MarketParams;
  }

  export interface OptimizationResult {
    total_cost: number;
    total_energy: number;
    total_duration: number;
    total_soc: number;
    total_soc_change: number;
  }

  export interface DailySchedule {
    start_time: string;
    end_time: string;
    energy_mw: number;
  }

  export interface SummaryData {
    total_cost: number;
    total_energy: number;
    total_duration: number;
    total_soc: number;
    total_soc_change: number;
  }
  
  