import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import nock from 'nock';
import { fetchMarketData } from '../lambda';
import { MarketParams } from '../types';

const { BATU_ENERGY_API_URL } = process.env;

if (!BATU_ENERGY_API_URL) {
  throw new Error('BATU_ENERGY_API_URL is not set');
}

describe('fetchMarketData', () => {
  const marketParams: MarketParams = {
    zone: 'APATZINGAN',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-01-31T23:59:59Z'
  };

  beforeEach(() => {
    nock.cleanAll();
  });

  it('should return market data for valid parameters', async () => {
    const mockResponse = { prices: [100, 200, 300] };

    nock(BATU_ENERGY_API_URL)
      .get('/electricity-data/pmls/zone')
      .query(marketParams)
      .reply(200, mockResponse);

    const data = await fetchMarketData(marketParams);
    expect(data).toEqual(mockResponse);
  });

  it('should throw an error for a failed API call', async () => {

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    nock(BATU_ENERGY_API_URL)
      .get('/electricity-data/pmls/zone')
      .query(marketParams)
      .reply(500);

    await expect(fetchMarketData(marketParams)).rejects.toThrow('Failed to fetch market data');

    consoleSpy.mockRestore();
  });
}); 