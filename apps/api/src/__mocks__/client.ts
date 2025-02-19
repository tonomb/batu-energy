import { AxiosInstance } from 'axios';
import { jest } from '@jest/globals';
const mockBatuEnergyApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  // Add other methods you need
} as unknown as jest.Mocked<AxiosInstance>;

export default mockBatuEnergyApiClient; 