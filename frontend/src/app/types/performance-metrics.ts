import { z } from 'zod';

export const MetricSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  type: z.string(),
  slice: z.string(),
  tooltip: z.string(),
  value: z.number(),
  threshold: z.number(),
  passed: z.boolean(),
  history: z.array(z.number()),
  timestamps: z.array(z.string()),
  sample_sizes: z.array(z.number()),
  status: z.string()
});

export const MetricCardsSchema = z.object({
  metrics: z.array(z.string()),
  tooltips: z.array(z.string()),
  slices: z.array(z.string()),
  collection: z.array(MetricSchema)
});

export const OverviewSchema = z.object({
  has_data: z.boolean(),
  last_n_evals: z.number(),
  mean_std_min_evals: z.number(),
  metric_cards: MetricCardsSchema
});

export const PerformanceDataSchema = z.object({
  overview: OverviewSchema
});

export type Metric = z.infer<typeof MetricSchema>;
export type PerformanceData = z.infer<typeof PerformanceDataSchema>;
