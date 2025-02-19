import { z } from 'zod';

export const BatteryParamsSchema = z.object({
    capacity_mw: z.number({
      required_error: "Capacity (MW) is required",
      invalid_type_error: "Capacity must be a number"
    }).positive("Capacity must be greater than 0"),
    duration_hours: z.number({
      required_error: "Duration (hours) is required",
      invalid_type_error: "Duration must be a number"
    }).positive("Duration must be greater than 0"),
    efficiency: z.number({
      required_error: "Efficiency is required",
      invalid_type_error: "Efficiency must be a number"
    }).min(0, "Efficiency must be between 0 and 1")
      .max(1, "Efficiency must be between 0 and 1"),
    min_soc: z.number({
      required_error: "Minimum State of Charge is required",
      invalid_type_error: "Minimum State of Charge must be a number"
    }).min(0, "Minimum State of Charge must be between 0 and 1")
      .max(1, "Minimum State of Charge must be between 0 and 1"),
    max_soc: z.number({
      required_error: "Maximum State of Charge is required",
      invalid_type_error: "Maximum State of Charge must be a number"
    }).min(0, "Maximum State of Charge must be between 0 and 1")
      .max(1, "Maximum State of Charge must be between 0 and 1")
  });
  
  export const MarketParamsSchema = z.object({
    load_zone_id: z.string({
      required_error: "Zone is required",
      invalid_type_error: "Zone must be a string"
    }),
    date_start: z.string({
      required_error: "Start date is required",
      invalid_type_error: "Start date must be a string"
    }).datetime("Start date must be a valid ISO datetime"),
    date_end: z.string({
      required_error: "End date is required",
      invalid_type_error: "End date must be a string"
    }).datetime("End date must be a valid ISO datetime")
  }).superRefine((data, ctx) => {
    if (new Date(data.date_start) > new Date(data.date_end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must be before end date",
        path: ["date_start"]
      });
    }
  });
  
  export const RequestSchema = z.object({
    battery_params: BatteryParamsSchema,
    market_params: MarketParamsSchema
  });