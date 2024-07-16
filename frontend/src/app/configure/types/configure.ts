import { z } from 'zod';

export const MetricConfigSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  type: z.string().min(1, "Metric type is required"),
});

export const SubgroupConditionSchema = z.object({
  type: z.enum(['value', 'range', 'contains', 'year', 'month', 'day'], {
    errorMap: () => ({ message: "Invalid condition type" })
  }),
  value: z.union([z.string(), z.number()]).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
});

export const SubgroupConfigSchema = z.object({
  column: z.string().min(1, "Column name is required"),
  condition: SubgroupConditionSchema,
});

export const EndpointConfigSchema = z.object({
  model_id: z.string().optional(),
  endpoint_name: z.string().min(1, "Endpoint name is required"),
  model_name: z.string().min(1, "Model name is required"),
  model_description: z.string(),
  metrics: z.array(MetricConfigSchema).min(1, "At least one metric is required"),
  subgroups: z.array(SubgroupConfigSchema),
});

export const EvaluationInputSchema = z.object({
  preds_prob: z.array(z.number()),
  target: z.array(z.number()),
  metadata: z.record(z.string(), z.array(z.any())),
});

export type MetricConfig = z.infer<typeof MetricConfigSchema>;
export type SubgroupCondition = z.infer<typeof SubgroupConditionSchema>;
export type SubgroupConfig = z.infer<typeof SubgroupConfigSchema>;
export type EndpointConfig = z.infer<typeof EndpointConfigSchema>;
export type EvaluationInput = z.infer<typeof EvaluationInputSchema>;
