import { z } from 'zod';

export const ModelHealthSchema = z.object({
  model_health: z.number(),
  health_over_time: z.array(z.number()),
  time_points: z.array(z.string())
});

export type ModelHealth = z.infer<typeof ModelHealthSchema>;

// Function to validate the data
export function validateModelHealth(data: unknown): ModelHealth {
  return ModelHealthSchema.parse(data);
}
