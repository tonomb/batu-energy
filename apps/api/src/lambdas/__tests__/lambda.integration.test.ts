import { describe, it, expect } from '@jest/globals';
import { handler } from '../lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { RequestBody } from '../types';


const mockRequest : RequestBody = {
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
      date_end: "2024-02-01T00:00:00Z"
    }
  }

describe.skip('Lambda Function Integration Test', () => {
  const event: APIGatewayProxyEvent = {
    body: JSON.stringify(mockRequest),
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
    resource: ''
  };

  it('should process the request and return an optimized schedule', async () => {
    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('daily_schedules');
    expect(body).toHaveProperty('summary');
  });
}); 