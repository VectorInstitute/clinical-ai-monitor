import { z } from 'zod';

export const MetricConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['binary', 'continuous']),
});

export const SubgroupConditionSchema = z.object({
  value: z.union([z.string(), z.number(), z.array(z.union([z.string(), z.number()]))]).optional(),
  min_value: z.union([z.string(), z.number()]).optional(),
  max_value: z.union([z.string(), z.number()]).optional(),
  min_inclusive: z.boolean().default(true),
  max_inclusive: z.boolean().default(true),
  year: z.union([z.number(), z.array(z.number())]).optional(),
  month: z.union([z.number(), z.array(z.number())]).optional(),
  day: z.union([z.number(), z.array(z.number())]).optional(),
  hour: z.union([z.number(), z.array(z.number())]).optional(),
  negate: z.boolean().default(false),
  keep_nulls: z.boolean().default(false),
});

export const SubgroupConfigSchema = z.object({
  name: z.string(),
  condition: SubgroupConditionSchema,
});

export const ServerConfigSchema = z.object({
  server_name: z.string(),
  model_name: z.string(),
  model_description: z.string(),
  metrics: z.array(MetricConfigSchema),
  subgroups: z.array(SubgroupConfigSchema),
});

export type MetricConfig = z.infer<typeof MetricConfigSchema>;
export type SubgroupCondition = z.infer<typeof SubgroupConditionSchema>;
export type SubgroupConfig = z.infer<typeof SubgroupConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
