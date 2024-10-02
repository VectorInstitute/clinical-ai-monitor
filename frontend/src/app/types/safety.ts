import { z } from 'zod';
import { MetricSchema } from './performance-metrics';

export const ModelSafetySchema = z.object({
  metrics: z.array(MetricSchema).optional().default([]),
  last_evaluated: z.string().nullable(),
  is_recently_evaluated: z.boolean(),
  overall_status: z.string()
});

export type Metric = z.infer<typeof MetricSchema>;
export type SafetyMetric = Metric;
export type ModelSafety = z.infer<typeof ModelSafetySchema>;

export function validateModelSafety(data: unknown): ModelSafety {
  return ModelSafetySchema.parse(data);
}
