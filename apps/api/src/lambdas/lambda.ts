import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RequestSchema} from "./schema";
import batuEnergyApiClient from '../client';
import {OptimizationResult, BatteryParams, MarketParams } from "./types";




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
export async function fetchMarketData(marketParams: MarketParams): Promise<any> {
  try {
    const response = await batuEnergyApiClient.get('/electricity-data/pmls/zone', { params: marketParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data');
  }
}

// Placeholder function for optimization logic
export function optimizeBatteryStorage(batteryParams: BatteryParams, marketData: any): OptimizationResult {
  // Implement your optimization logic here
  return {
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
};

