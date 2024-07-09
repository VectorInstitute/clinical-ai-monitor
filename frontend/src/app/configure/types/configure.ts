import { z } from 'zod';

export const MetricConfigSchema = z.object({
  name: z.string(),
  type: z.string(),
});

export const SubgroupConditionSchema = z.record(z.any());

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
