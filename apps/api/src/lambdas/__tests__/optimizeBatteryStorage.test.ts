import { describe, it, expect } from '@jest/globals';
import { optimizeBatteryStorage } from '../lambda';
import { BatteryParams, BatuEnergyApiResponse } from '../types';

describe('optimizeBatteryStorage', () => {
  const batteryParams: BatteryParams = {
    capacity_mw: 10,
    duration_hours: 4,
    efficiency: 0.85,
    min_soc: 0.1,
    max_soc: 1.0
  };

  const marketData: BatuEnergyApiResponse = {
    status: 'success',
    items: 2,
    data: [
      { load_zone_id: '1', timestamp: '2024-01-01T00:00:00Z', date: '2024-01-01', hour: '0', pml: 900, pml_cng: 0, pml_ene: 0, pml_per: 0 },
      { load_zone_id: '1', timestamp: '2024-01-01T01:00:00Z', date: '2024-01-01', hour: '1', pml: 1100, pml_cng: 0, pml_ene: 0, pml_per: 0 }
    ]
  };

  const expectedResult = {
    daily_schedules: [
      {
        date: "2024-01-01",
        schedule: [
          { hour: 0, action: "charge", power: 5, price: 1200, soc: 0.5 },
          { hour: 1, action: "idle", power: 0, price: 1250, soc: 0.5 }
        ],
        revenue: 1500.00,
        energy_charged: 20,
        energy_discharged: 20,
        avg_charge_price: 1100,
        avg_discharge_price: 1400
      }
    ],
    summary: {
      total_revenue: 45000.00,
      avg_daily_revenue: 1450.00,
      best_day: { date: "2024-01-05", revenue: 2000 },
      worst_day: { date: "2024-01-15", revenue: 500 }
    }
  };



  it('should optimize battery storage based on market data', () => {
    const result = optimizeBatteryStorage(batteryParams, marketData);
    
    const { daily_schedules, summary } = result;
    expect(result).toEqual(expectedResult);
    expect(daily_schedules[0].date).toBeDefined();
    expect(daily_schedules[0].schedule).toBeDefined();
    expect(daily_schedules[0].revenue).toBeDefined();
    expect(daily_schedules[0].energy_charged).toBeDefined();
    expect(daily_schedules[0].energy_discharged).toBeDefined();
    expect(daily_schedules[0].avg_charge_price).toBeDefined();
    expect(daily_schedules[0].avg_discharge_price).toBeDefined();
    expect(summary.total_revenue).toBeDefined();
    expect(summary.avg_daily_revenue).toBeDefined();
    expect(summary.best_day.revenue).toBeDefined();
    expect(summary.worst_day.revenue).toBeDefined();
  });
});
