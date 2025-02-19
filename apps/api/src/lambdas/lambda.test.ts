import { describe, it, expect, jest } from '@jest/globals';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './lambda';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    mockedAxios.get.mockResolvedValueOnce({ 
      data: { prices: [100, 200, 300] } 
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
        zone: "APATZINGAN",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z"
      }
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('message');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.batuenergy.com/market-data',
      expect.any(Object)
    );
  });

  it('should handle missing required parameters', async () => {
    const event = createMockEvent({
      // Missing battery_params
      battery_params: {
        capacity_mw: '10',
      },
      market_params: {
        zone: "APATZINGAN",
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-31T23:59:59Z"
      }
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Missing or invalid parameters');
    expect(JSON.parse(response.body)).toHaveProperty('errors');
    expect(JSON.parse(response.body).errors).toBeInstanceOf(Array);
    expect(JSON.parse(response.body).errors).toHaveLength(5);
  });
});
