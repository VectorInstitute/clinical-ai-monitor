import { z } from 'zod';

export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  status: z.enum(['met', 'not met'])
});

export const ModelSafetySchema = z.object({
  metrics: z.array(MetricSchema),
  last_evaluated: z.string().datetime(),
  overall_status: z.string()
});

export type Metric = z.infer<typeof MetricSchema>;
export type SafetyMetric = Metric;
export type ModelSafety = z.infer<typeof ModelSafetySchema>;

// Function to validate the data
export function validateModelSafety(data: unknown): ModelSafety {
  return ModelSafetySchema.parse(data);
}
