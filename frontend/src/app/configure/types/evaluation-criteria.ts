import { z } from 'zod';

export const CriterionSchema = z.object({
  id: z.string().optional(),
  metric_name: z.string(),
  display_name: z.string(),
  operator: z.enum(['>', '<', '=', '>=', '<=']),
  threshold: z.number(),
});

export const EvaluationFrequencySchema = z.object({
  value: z.number().positive(),
  unit: z.enum(['hours', 'days', 'weeks', 'months']),
});

export type Criterion = z.infer<typeof CriterionSchema>;
export type EvaluationFrequency = z.infer<typeof EvaluationFrequencySchema>;
