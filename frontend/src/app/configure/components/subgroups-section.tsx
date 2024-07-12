import React from 'react';
import { FieldArray, Field } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  Button,
  VStack,
  HStack,
  Box,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';

const conditionTypes = [
  { value: 'value', label: 'Exact Value' },
  { value: 'range', label: 'Range' },
  { value: 'contains', label: 'Contains' },
  { value: 'year', label: 'Year' },
  { value: 'month', label: 'Month' },
  { value: 'day', label: 'Day' },
];

const TooltipLabel: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <HStack>
    <FormLabel mb={0}>{label}</FormLabel>
    <Tooltip label={tooltip} hasArrow>
      <InfoIcon />
    </Tooltip>
  </HStack>
);

export const SubgroupsSection: React.FC = () => (
  <FieldArray name="subgroups">
    {({ push, remove, form }) => (
      <FormControl>
        <FormLabel>Subgroups</FormLabel>
        {form.values.subgroups.map((subgroup, index) => (
          <Box key={index} borderWidth="1px" borderRadius="lg" p={4} mb={4}>
            <VStack spacing={2} align="stretch">
              <Field name={`subgroups.${index}.column`}>
                {({ field }) => (
                  <FormControl>
                    <TooltipLabel
                      label="Column"
                      tooltip="The name of the column in your dataset to apply the condition"
                    />
                    <Input {...field} placeholder="Column name" />
                  </FormControl>
                )}
              </Field>
              <Field name={`subgroups.${index}.condition.type`}>
                {({ field }) => (
                  <FormControl>
                    <TooltipLabel
                      label="Condition Type"
                      tooltip="The type of condition to apply to the column"
                    />
                    <Select {...field} placeholder="Select condition type">
                      {conditionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Field>
              {subgroup.condition.type === 'value' && (
                <Field name={`subgroups.${index}.condition.value`}>
                  {({ field }) => (
                    <FormControl>
                      <TooltipLabel
                        label="Value"
                        tooltip="The exact value to match in the column"
                      />
                      <Input {...field} placeholder="Value" />
                    </FormControl>
                  )}
                </Field>
              )}
              {subgroup.condition.type === 'range' && (
                <HStack>
                  <Field name={`subgroups.${index}.condition.min_value`}>
                    {({ field }) => (
                      <FormControl>
                        <TooltipLabel
                          label="Min Value"
                          tooltip="The minimum value of the range (inclusive)"
                        />
                        <Input {...field} placeholder="Min value" type="number" />
                      </FormControl>
                    )}
                  </Field>
                  <Field name={`subgroups.${index}.condition.max_value`}>
                    {({ field }) => (
                      <FormControl>
                        <TooltipLabel
                          label="Max Value"
                          tooltip="The maximum value of the range (inclusive)"
                        />
                        <Input {...field} placeholder="Max value" type="number" />
                      </FormControl>
                    )}
                  </Field>
                </HStack>
              )}
              {subgroup.condition.type === 'contains' && (
                <Field name={`subgroups.${index}.condition.value`}>
                  {({ field }) => (
                    <FormControl>
                      <TooltipLabel
                        label="Contains"
                        tooltip="The value that the column should contain"
                      />
                      <Input {...field} placeholder="Contains value" />
                    </FormControl>
                  )}
                </Field>
              )}
              {['year', 'month', 'day'].includes(subgroup.condition.type) && (
                <Field name={`subgroups.${index}.condition.value`}>
                  {({ field }) => (
                    <FormControl>
                      <TooltipLabel
                        label={subgroup.condition.type.charAt(0).toUpperCase() + subgroup.condition.type.slice(1)}
                        tooltip={`The ${subgroup.condition.type} value to filter on (for timestamp columns)`}
                      />
                      <Input {...field} placeholder={`${subgroup.condition.type} value`} type="number" />
                    </FormControl>
                  )}
                </Field>
              )}
              <IconButton
                aria-label="Remove subgroup"
                icon={<DeleteIcon />}
                onClick={() => remove(index)}
              />
            </VStack>
          </Box>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => push({ column: '', condition: { type: '' } })}
        >
          Add Subgroup
        </Button>
      </FormControl>
    )}
  </FieldArray>
);
