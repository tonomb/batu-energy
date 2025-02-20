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
export function optimizeBatteryStorage(batteryParams: BatteryParams, marketData: BatuEnergyApiResponse): OptimizationResult {
  const { capacity_mw, efficiency, min_soc, max_soc } = batteryParams;
  const movingAveragePeriod = 5; // Example period for moving average
  const schedules = [];
  let soc = min_soc;

  let totalCycles = 0;
  let totalCycleRevenue = 0;
  let totalArbitrageSpread = 0;

  let lastChargePrice = 0;
  let lastChargePower = 0;

  for (let i = 0; i < marketData.data.length; i++) {
    const entry = marketData.data[i];
    const price = entry.pml;
    const movingAverage = marketData.data.slice(Math.max(0, i - movingAveragePeriod), i).reduce((sum, e) => sum + e.pml, 0) / movingAveragePeriod;

    let action = Action.IDLE;
    let power = 0;

    if (price < movingAverage && soc < max_soc) {
      action = Action.CHARGE;
      power = capacity_mw * efficiency;
      soc = Math.min(max_soc, soc + power / capacity_mw);
      lastChargePrice = price;
      lastChargePower = power;
    } else if (price > movingAverage && soc > min_soc) {
      action = Action.DISCHARGE;
      power = capacity_mw;
      soc = Math.max(min_soc, soc - power / capacity_mw);

      // Calculate cycle metrics
      if (lastChargePower > 0) {
        totalCycles++;
        totalCycleRevenue += price * power - lastChargePrice * lastChargePower;
        totalArbitrageSpread += price - lastChargePrice;
        lastChargePower = 0; // Reset after discharge
      }
    }

    schedules.push({ hour: parseInt(entry.hour, 10), action, power, price, soc });
  }

  const dailySchedules = [{
    date: marketData.data[0].date,
    schedule: schedules,
    revenue: schedules.reduce((acc, curr) => acc + (curr.action === Action.DISCHARGE ? curr.price * curr.power : 0), 0),
    energy_charged: schedules.filter(s => s.action === Action.CHARGE).reduce((acc, curr) => acc + curr.power, 0),
    energy_discharged: schedules.filter(s => s.action === Action.DISCHARGE).reduce((acc, curr) => acc + curr.power, 0),
    avg_charge_price: schedules.filter(s => s.action === Action.CHARGE).reduce((acc, curr) => acc + curr.price, 0) / schedules.filter(s => s.action === Action.CHARGE).length,
    avg_discharge_price: schedules.filter(s => s.action === Action.DISCHARGE).reduce((acc, curr) => acc + curr.price, 0) / schedules.filter(s => s.action === Action.DISCHARGE).length,
  }];

  return {
    daily_schedules: dailySchedules,
    summary: {
      total_revenue: dailySchedules.reduce((acc, curr) => acc + curr.revenue, 0),
      avg_daily_revenue: dailySchedules.reduce((acc, curr) => acc + curr.revenue, 0) / dailySchedules.length,
      best_day: {
        date: dailySchedules.reduce((best, curr) => curr.revenue > best.revenue ? curr : best, dailySchedules[0]).date,
        revenue: dailySchedules.reduce((best, curr) => curr.revenue > best.revenue ? curr : best, dailySchedules[0]).revenue
      },
      worst_day: {
        date: dailySchedules.reduce((worst, curr) => curr.revenue < worst.revenue ? curr : worst, dailySchedules[0]).date,
        revenue: dailySchedules.reduce((worst, curr) => curr.revenue < worst.revenue ? curr : worst, dailySchedules[0]).revenue
      },
      total_cycles: totalCycles,
      avg_cycle_revenue: totalCycles > 0 ? totalCycleRevenue / totalCycles : 0,
      avg_arbitrage_spread: totalCycles > 0 ? totalArbitrageSpread / totalCycles : 0
    }
  };
}

