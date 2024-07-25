import { z } from 'zod';

export const modelValidationSchema = z.object({
  name: z.string().nonempty('Required'),
  version: z.string().nonempty('Required'),
  type: z.string().nonempty('Required'),
  intended_use: z.string().nonempty('Required'),
  target_population: z.string().nonempty('Required'),
  input_data: z.array(z.string()).min(1, 'At least one input data is required'),
  output_data: z.string().nonempty('Required'),
  summary: z.string().nonempty('Required'),
  mechanism_of_action: z.string().nonempty('Required'),
  validation_and_performance: z.object({
    internal_validation: z.string().nonempty('Required'),
    external_validation: z.string().nonempty('Required'),
    performance_in_subgroups: z.array(z.string()).min(1, 'At least one subgroup performance is required'),
  }),
  uses_and_directions: z.array(z.string()).min(1, 'At least one use/direction is required'),
  warnings: z.array(z.string()).min(1, 'At least one warning is required'),
  other_information: z.object({
    approval_date: z.string().nonempty('Required'),
    license: z.string().nonempty('Required'),
    contact_information: z.string().nonempty('Required'),
    publication_link: z.string().url('Must be a valid URL').optional(),
  }),
});

export type ModelFactsFormData = z.infer<typeof modelValidationSchema>;
