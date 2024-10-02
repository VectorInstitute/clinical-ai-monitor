import { z } from 'zod';

import { ModelFacts } from './facts';
import { CriterionSchema, EvaluationFrequencySchema } from './evaluation-criteria';

export const ModelBasicInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
});

export const ModelDataSchema = z.object({
  id: z.string(),
  endpoints: z.array(z.string()),
  basic_info: ModelBasicInfoSchema,
  facts: z.custom<ModelFacts>().nullable(),
  evaluation_criteria: z.array(CriterionSchema),
  evaluation_frequency: EvaluationFrequencySchema.nullable(),
  overall_status: z.string(),
});

export type ModelBasicInfo = z.infer<typeof ModelBasicInfoSchema>;
export type ModelData = z.infer<typeof ModelDataSchema>;
