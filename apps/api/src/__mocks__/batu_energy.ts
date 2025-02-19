import { BatuEnergyApiResponse } from "../lambdas/types";

export const mockMarketData: BatuEnergyApiResponse = {
    status: 'success',
    items: 1,
    data: [
      {
        date: '2024-01-02',
        pml_ene: 272.8,
        pml_cng: 0,
        pml_per: 10.39,
        timestamp: '2024-01-02 00:00:00',
        hour: '1',
        load_zone_id: 'APATZINGAN',
        pml: 283.19
      }]
    }