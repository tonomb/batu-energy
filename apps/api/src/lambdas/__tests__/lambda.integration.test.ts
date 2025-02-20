import { describe, it, expect } from '@jest/globals';
import { handler } from '../lambda';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { RequestBody } from '../types';
import util from 'util';


const nodes = ['MONTERREY'];

describe('Lambda Function Integration Test', () => {
  nodes.forEach(node => {
    it(`should process the request and return an optimized schedule for node ${node}`, async () => {
      const mockRequest: RequestBody = {
        battery_params: {
          capacity_mw: 10,
          duration_hours: 4,
          efficiency: 0.85,
          min_soc: 0.1,
          max_soc: 1.0
        },
        market_params: {
          load_zone_id: node,
          date_start: '2024-01-01T00:00:00Z',
          date_end: '2024-01-02T00:00:00Z'
        }
      };

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

      const response = await handler(event);
      expect(response.statusCode).toBe(200);

      console.log('NODE: ', node);
      console.log(util.inspect(JSON.parse(response.body), false, null, true /* enable colors */));
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('daily_schedules');
      expect(body).toHaveProperty('summary');
      expect(body.summary.total_revenue).toBeGreaterThanOrEqual(0);
      expect(body.summary.avg_daily_revenue).toBeGreaterThanOrEqual(0);
      expect(body.summary.best_day).toBeDefined();
      expect(body.summary.worst_day).toBeDefined();
    });
  });
}); 