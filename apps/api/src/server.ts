import { json, urlencoded } from "body-parser";
import express, { type Express } from "express";
import morgan from "morgan";
import cors from "cors";
import { RequestSchema } from "./lambdas/schema";
import { fetchMarketData, optimizeBatteryStorage } from "./lambdas/lambda";

export const createServer = (): Express => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .get("/status", (_, res) => {
      return res.json({ ok: true });
    })
    .post("/optimize", async (req, res) => {
      try {
        // Use the same validation logic as the lambda
        const parsedBody = RequestSchema.safeParse(req.body);

        if (!parsedBody.success) {
          console.log('Validation failed. Errors:', parsedBody.error.errors);
          return res.status(400).json({ 
            message: 'Missing or invalid parameters',
            errors: parsedBody.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        
        const { battery_params, market_params } = parsedBody.data;

        // Use the same processing logic as the lambda
        const marketData = await fetchMarketData(market_params);
        const optimizationResult = optimizeBatteryStorage(battery_params, marketData);

        return res.json(optimizationResult);
      } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    })
    
    .post("/market-data", async (req, res) => {
      try {
        // Change from req.query to req.body since we're using POST
        const { load_zone_id, date_start, date_end } = req.body;
        
        const marketData = await fetchMarketData({
          load_zone_id: load_zone_id,
          date_start: date_start,
          date_end: date_end,
        });

        return res.json(marketData);
      } catch (error) {
        console.error('Error fetching market data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    });

  return app;
};
