import { z } from 'zod';

export const COESchema = z.object({
  ts: z.string(),                   // ISO timestamp
  site_id: z.string(),              // e.g. "thermal-plant-demo"
  src: z.object({
    ip: z.string().optional(),
    role: z.string().optional()     // e.g., "BOILER-HMI", "ENGINEER", "TCS-HMI"
  }),
  dst: z.object({
    ip: z.string().optional(),
    asset_id: z.string().optional()
  }).optional(),
  protocol: z.enum(['modbus', 'mqtt']),
  verb: z.enum(['write_register', 'read_register', 'publish']),
  resource: z.string(),             // "reg:40012" or "topic:plant1/sensors/temperature"
  value: z.union([z.number(), z.string(), z.null()]).optional(),
  meta: z.record(z.unknown()).optional()
});

export type COE = z.infer<typeof COESchema>;

