import { describe, it, expect, jest } from '@jest/globals';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../lambda';
import {  OptimizationResult } from '../types';
import { mockMarketData } from '../../__mocks__/batu_energy';
// Mock axios
jest.mock('../../client');
import batuEnergyApiClient from '../../client';



// Now you can use the mocked client in your tests
const mockedClient = batuEnergyApiClient as jest.Mocked<typeof batuEnergyApiClient>;

describe('Lambda Handler', () => {
  // Create a mock API Gateway event
  const createMockEvent = (body: object): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/optimize',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  });

  it('should handle valid optimization request', async () => {
    // Mock the market data response
    mockedClient.get.mockResolvedValueOnce({ 
      data: mockMarketData
    });

    const event = createMockEvent({
      battery_params: {
        capacity_mw: 10,
        duration_hours: 4,
        efficiency: 0.85,
        min_soc: 0.1,
        max_soc: 1.0
      },
      market_params: {
        load_zone_id: "APATZINGAN",
        date_start: "2024-01-01T00:00:00Z",
        date_end: "2024-01-31T23:59:59Z"
      }
    });

    const mockResult: OptimizationResult =  {
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

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockResult);
   
  });

  it('should handle missing or invalid parameters', async () => {
    const event = createMockEvent({
      // Missing battery_params
      battery_params: {
        capacity_mw: '10', // Invalid type
      },
      market_params: {
        load_zone_id: "APATZINGAN",
        date_start: "2024-01-01T00:00:00Z",
        date_end: "2024-01-31T23:59:59Z"
      }
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Missing or invalid parameters');
    expect(JSON.parse(response.body)).toHaveProperty('errors');
    expect(JSON.parse(response.body).errors).toBeInstanceOf(Array);
    expect(JSON.parse(response.body).errors).toHaveLength(5);

    // console.log(JSON.parse(response.body)); // for debugging
  });
});
