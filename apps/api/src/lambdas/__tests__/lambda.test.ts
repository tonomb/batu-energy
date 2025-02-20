import { describe, it, expect, jest } from '@jest/globals';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../lambda';
import {  OptimizationResult, Action } from '../types';
import { mockMarketData } from '../../__mocks__/batu_energy';
import { optimizeBatteryStorage } from '../lambda';
import { BatteryParams, BatuEnergyApiResponse } from '../types';


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

  it.skip('should handle valid optimization request', async () => {
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
      daily_schedules: [{
        date: "2024-01-01",
        schedule: [{ hour: 0, action: Action.CHARGE, power: 5, price: 1200, soc: 0.5 }, { hour: 1, action: Action.IDLE, power: 0, price: 1250, soc: 0.5 }],
        revenue: 1500.00,
        energy_charged: 20,
        energy_discharged: 20,
        avg_charge_price: 1100,
        avg_discharge_price: 1400
      }],
      summary: {
        total_revenue: 45000.00,
        avg_daily_revenue: 1450.00,
        best_day: { date: "2024-01-05", revenue: 2000 },
        worst_day: { date: "2024-01-15", revenue: 500 },
        total_cycles: 0,
        avg_cycle_revenue: 0,
        avg_arbitrage_spread: 0
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

describe('optimizeBatteryStorage', () => {
  const batteryParams: BatteryParams = {
    capacity_mw: 10,
    duration_hours: 4,
    efficiency: 0.85,
    min_soc: 0.1,
    max_soc: 1.0
  };

  // Mock market data for different scenarios
  const mockMarketData: BatuEnergyApiResponse = {
    status: 'success',
    items: 3,
    data: [
      { load_zone_id: '1', timestamp: '2024-01-01T00:00:00Z', date: '2024-01-01', hour: '0', pml: 900, pml_cng: 0, pml_ene: 0, pml_per: 0 },
      { load_zone_id: '1', timestamp: '2024-01-01T01:00:00Z', date: '2024-01-01', hour: '1', pml: 1100, pml_cng: 0, pml_ene: 0, pml_per: 0 },
      { load_zone_id: '1', timestamp: '2024-01-01T02:00:00Z', date: '2024-01-01', hour: '2', pml: 950, pml_cng: 0, pml_ene: 0, pml_per: 0 }
    ]
  };

  it('should optimize battery storage schedule', () => {
    const result: OptimizationResult = optimizeBatteryStorage(batteryParams, mockMarketData);

    // Check that the result is defined and has the expected structure
    expect(result).toBeDefined();
    expect(result.daily_schedules).toHaveLength(1);
    expect(result.summary).toBeDefined();

    // Validate SOC constraints
    result.daily_schedules[0].schedule.forEach(action => {
      expect(action.soc).toBeGreaterThanOrEqual(batteryParams.min_soc);
      expect(action.soc).toBeLessThanOrEqual(batteryParams.max_soc);
    });

    // Validate revenue calculation
    const totalRevenue = result.daily_schedules[0].revenue;
    expect(totalRevenue).toBeGreaterThanOrEqual(0);

    // Validate efficiency losses
    const chargedEnergy = result.daily_schedules[0].energy_charged;
    expect(chargedEnergy).toBeLessThanOrEqual(batteryParams.capacity_mw * batteryParams.duration_hours * batteryParams.efficiency);
  });

  it('should handle edge cases with extreme prices', () => {
    const extremeMarketData: BatuEnergyApiResponse = {
      status: 'success',
      items: 3,
      data: [
        { load_zone_id: '1', timestamp: '2024-01-01T00:00:00Z', date: '2024-01-01', hour: '0', pml: 500, pml_cng: 0, pml_ene: 0, pml_per: 0 },
        { load_zone_id: '1', timestamp: '2024-01-01T01:00:00Z', date: '2024-01-01', hour: '1', pml: 2000, pml_cng: 0, pml_ene: 0, pml_per: 0 },
        { load_zone_id: '1', timestamp: '2024-01-01T02:00:00Z', date: '2024-01-01', hour: '2', pml: 300, pml_cng: 0, pml_ene: 0, pml_per: 0 }
      ]
    };

    const result: OptimizationResult = optimizeBatteryStorage(batteryParams, extremeMarketData);

    // Check that the result is defined and has the expected structure
    expect(result).toBeDefined();
    expect(result.daily_schedules).toHaveLength(1);
    expect(result.summary).toBeDefined();

    // Validate SOC constraints
    result.daily_schedules[0].schedule.forEach(action => {
      expect(action.soc).toBeGreaterThanOrEqual(batteryParams.min_soc);
      expect(action.soc).toBeLessThanOrEqual(batteryParams.max_soc);
    });

    // Validate revenue calculation
    const totalRevenue = result.daily_schedules[0].revenue;
    expect(totalRevenue).toBeGreaterThanOrEqual(0);
  });

  it('should return correct BestWorstDay type in summary', () => {
    const batteryParams: BatteryParams = {
      capacity_mw: 10,
      duration_hours: 4,
      efficiency: 0.85,
      min_soc: 0.1,
      max_soc: 1.0
    };

    // Create mock market data with multiple days
    const mockMarketData: BatuEnergyApiResponse = {
      status: 'success',
      items: 6,
      data: [
        { load_zone_id: '1', timestamp: '2024-01-01T00:00:00Z', date: '2024-01-01', hour: '0', pml: 1000, pml_cng: 0, pml_ene: 0, pml_per: 0 },
        { load_zone_id: '1', timestamp: '2024-01-01T01:00:00Z', date: '2024-01-01', hour: '1', pml: 1200, pml_cng: 0, pml_ene: 0, pml_per: 0 },
        { load_zone_id: '1', timestamp: '2024-01-02T00:00:00Z', date: '2024-01-02', hour: '0', pml: 800, pml_cng: 0, pml_ene: 0, pml_per: 0 },
        { load_zone_id: '1', timestamp: '2024-01-02T01:00:00Z', date: '2024-01-02', hour: '1', pml: 900, pml_cng: 0, pml_ene: 0, pml_per: 0 }
      ]
    };

    const result = optimizeBatteryStorage(batteryParams, mockMarketData);

    // Check best_day type
    expect(result.summary.best_day).toEqual({
      date: expect.any(String),
      revenue: expect.any(Number)
    });

    // Check worst_day type
    expect(result.summary.worst_day).toEqual({
      date: expect.any(String),
      revenue: expect.any(Number)
    });

    // Ensure no additional properties are present
    expect(Object.keys(result.summary.best_day)).toHaveLength(2);
    expect(Object.keys(result.summary.worst_day)).toHaveLength(2);
  });
});


