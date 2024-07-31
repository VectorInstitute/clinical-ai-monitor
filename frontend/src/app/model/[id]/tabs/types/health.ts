import { z } from 'zod';

export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  status: z.enum(['met', 'not met'])
});

export const ModelHealthSchema = z.object({
  metrics: z.array(MetricSchema),
  last_evaluated: z.string().datetime()
});

export type Metric = z.infer<typeof MetricSchema>;
export type ModelHealth = z.infer<typeof ModelHealthSchema>;

// Function to validate the data
export function validateModelHealth(data: unknown): ModelHealth {
  return ModelHealthSchema.parse(data);
}
