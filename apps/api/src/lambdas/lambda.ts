import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RequestSchema} from "./schema";
import batuEnergyApiClient from '../client';
import {OptimizationResult, BatteryParams, MarketParams, BatuEnergyApiResponse , Action} from "./types";




export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse and validate request body
    const parsedBody = RequestSchema.safeParse(JSON.parse(event.body || '{}'));
    
    if (!parsedBody.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: 'Missing or invalid parameters',
          errors: parsedBody.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }),
      };
    }

    const { battery_params, market_params } = parsedBody.data ;

    // Fetch market data
    const marketData = await fetchMarketData(market_params);

    // Process optimization
    const optimizationResult = optimizeBatteryStorage(battery_params, marketData);

    return {
      statusCode: 200,
      body: JSON.stringify(optimizationResult),
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

// Placeholder function to fetch market data
export async function fetchMarketData(marketParams: MarketParams): Promise<BatuEnergyApiResponse> {
  try {
    const response = await batuEnergyApiClient.get('/electricity-data/pmls/zone', { params: marketParams });
   
    if(response.data.status === 'success' && response.data.items === 0) {
      throw new Error(`No data found for the given market parameters ${JSON.stringify(marketParams)}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data');
  }
}


// TODO: Use mathjs to handle big numbers and decimal precision
export function optimizeBatteryStorage(
  batteryParams: BatteryParams,
  marketData: BatuEnergyApiResponse
): OptimizationResult {
  const { capacity_mw, efficiency, min_soc, max_soc } = batteryParams;
  const minSpreadThreshold = 5; // Arbitrage threshold for profitable trades

  let soc = min_soc;
  let totalCycles = 0;
  let totalCycleRevenue = 0;
  let totalArbitrageSpread = 0;

  let lastChargePrice = 0;
  let lastChargePower = 0;

  const schedulesByDate = new Map<string, any[]>();
  const revenueByDate = new Map<string, number>();

  const round = (num: number) => Math.round(num * 100) / 100;

  for (let i = 0; i < marketData.data.length; i++) {
    const entry = marketData.data[i];
    const nextPrice = marketData.data[i + 1]?.pml ?? entry.pml;
    const price = entry.pml;
    const date = entry.date;

    if (!schedulesByDate.has(date)) schedulesByDate.set(date, []);
    if (!revenueByDate.has(date)) revenueByDate.set(date, 0);

    let action: Action = Action.IDLE;
    let power = 0;

    if (price === 0) {
      continue; // Ignore and move to the next valid price
    }
    
    
    if (price < nextPrice - minSpreadThreshold && soc < max_soc) {
      // Charge when price is low relative to next expected price
      action = Action.CHARGE;
      power = round(Math.min(capacity_mw * efficiency, (max_soc - soc) * capacity_mw));
      soc = round(Math.min(max_soc, soc + (power / capacity_mw) * efficiency));
      lastChargePrice = price;
      lastChargePower = power;
      revenueByDate.set(date, round(revenueByDate.get(date)! - power * price));
    } else if (price > lastChargePrice + minSpreadThreshold && soc > min_soc) {
      // Discharge when price is high relative to last charged price
      action = Action.DISCHARGE;
      power = round(Math.min(capacity_mw, (soc - min_soc) * capacity_mw));
      soc = round(Math.max(min_soc, soc - (power / capacity_mw)));
      revenueByDate.set(date, round(revenueByDate.get(date)! + power * price));

      if (lastChargePower > 0) {
        totalCycles++;
        totalCycleRevenue += price * power - lastChargePrice * lastChargePower;
        totalArbitrageSpread += price - lastChargePrice;
        lastChargePower = 0;
      }
    }

    schedulesByDate.get(date)!.push({ hour: parseInt(entry.hour, 10), action, power, price, soc });
  }

  // Generate daily schedules with calculated statistics
  const dailySchedules = Array.from(schedulesByDate.entries()).map(([date, schedule]) => ({
    date,
    schedule,
    revenue: round(revenueByDate.get(date) ?? 0),
    energy_charged: round(schedule.filter(s => s.action === Action.CHARGE).reduce((acc, curr) => acc + curr.power, 0)),
    energy_discharged: round(schedule.filter(s => s.action === Action.DISCHARGE).reduce((acc, curr) => acc + curr.power, 0)),
    avg_charge_price: round(
      schedule.filter(s => s.action === Action.CHARGE).reduce((acc, curr) => acc + curr.price, 0) /
        Math.max(1, schedule.filter(s => s.action === Action.CHARGE).length)
    ),
    avg_discharge_price: round(
      schedule.filter(s => s.action === Action.DISCHARGE).reduce((acc, curr) => acc + curr.price, 0) /
        Math.max(1, schedule.filter(s => s.action === Action.DISCHARGE).length)
    ),
  }));

  // Identify best and worst day based on revenue
  const bestDay = dailySchedules.reduce((best, curr) => (curr.revenue > best.revenue ? curr : best), dailySchedules[0]);
  const worstDay = dailySchedules.reduce((worst, curr) => (curr.revenue < worst.revenue ? curr : worst), dailySchedules[0]);

  return {
    daily_schedules: dailySchedules,
    summary: {
      total_revenue: round(dailySchedules.reduce((acc, curr) => acc + curr.revenue, 0)),
      avg_daily_revenue: round(dailySchedules.reduce((acc, curr) => acc + curr.revenue, 0) / dailySchedules.length),
      best_day: { date: bestDay.date, revenue: bestDay.revenue },
      worst_day: { date: worstDay.date, revenue: worstDay.revenue },
      total_cycles: totalCycles,
      avg_cycle_revenue: totalCycles > 0 ? round(totalCycleRevenue / totalCycles) : 0,
      avg_arbitrage_spread: totalCycles > 0 ? round(totalArbitrageSpread / totalCycles) : 0,
    },
  };
}




