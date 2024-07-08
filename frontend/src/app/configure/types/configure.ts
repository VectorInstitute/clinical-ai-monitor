import { z } from 'zod';

export const MetricConfigSchema = z.object({
  name: z.string(),
  type: z.literal('binary'),
});

export const SubgroupConditionSchema = z.object({
  column: z.string(),
  operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte']),
  value: z.union([z.string(), z.number()]),
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
