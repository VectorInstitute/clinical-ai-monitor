import React from 'react';
import { FieldArray, Field, useFormikContext, FieldProps, getIn } from 'formik';
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
  FormErrorMessage,
  Text,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { EndpointConfig, SubgroupConfig } from '../types/configure';

const conditionTypes = [
  { value: 'value', label: 'Exact Value' },
  { value: 'range', label: 'Range' },
  { value: 'contains', label: 'Contains' },
  { value: 'year', label: 'Year' },
  { value: 'month', label: 'Month' },
  { value: 'day', label: 'Day' },
];

interface TooltipLabelProps {
  label: string;
  tooltip: string;
}

const TooltipLabel: React.FC<TooltipLabelProps> = ({ label, tooltip }) => (
  <HStack>
    <FormLabel mb={0}>{label}</FormLabel>
    <Tooltip label={tooltip} hasArrow>
      <InfoIcon />
    </Tooltip>
  </HStack>
);

export const SubgroupsSection: React.FC = () => {
  const { values, errors, touched } = useFormikContext<EndpointConfig>();

  return (
    <FieldArray name="subgroups">
      {({ push, remove }) => (
        <FormControl isInvalid={!!(errors.subgroups && touched.subgroups)}>
          <FormLabel>Subgroups</FormLabel>
          {values.subgroups.map((subgroup: SubgroupConfig, index: number) => (
            <Box key={index} borderWidth="1px" borderRadius="lg" p={4} mb={4}>
              <VStack spacing={2} align="stretch">
                <Field name={`subgroups.${index}.column`}>
                  {({ field, form }: FieldProps) => (
                    <FormControl isInvalid={!!getIn(form.errors, `subgroups.${index}.column`) && !!getIn(form.touched, `subgroups.${index}.column`)}>
                      <TooltipLabel
                        label="Column"
                        tooltip="The name of the column in your dataset to apply the condition"
                      />
                      <Input {...field} placeholder="Column name" />
                      <FormErrorMessage>{getIn(form.errors, `subgroups.${index}.column`)}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name={`subgroups.${index}.condition.type`}>
                  {({ field, form }: FieldProps) => (
                    <FormControl isInvalid={!!getIn(form.errors, `subgroups.${index}.condition.type`) && !!getIn(form.touched, `subgroups.${index}.condition.type`)}>
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
                      <FormErrorMessage>{getIn(form.errors, `subgroups.${index}.condition.type`)}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                {subgroup.condition.type === 'value' && (
                  <Field name={`subgroups.${index}.condition.value`}>
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!getIn(form.errors, `subgroups.${index}.condition.value`) && !!getIn(form.touched, `subgroups.${index}.condition.value`)}>
                        <TooltipLabel
                          label="Value"
                          tooltip="The exact value to match in the column"
                        />
                        <Input {...field} placeholder="Value" />
                        <FormErrorMessage>{getIn(form.errors, `subgroups.${index}.condition.value`)}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                )}
                {subgroup.condition.type === 'range' && (
                  <HStack>
                    <Field name={`subgroups.${index}.condition.min_value`}>
                      {({ field, form }: FieldProps) => (
                        <FormControl isInvalid={!!getIn(form.errors, `subgroups.${index}.condition.min_value`) && !!getIn(form.touched, `subgroups.${index}.condition.min_value`)}>
                          <TooltipLabel
                            label="Min Value"
                            tooltip="The minimum value of the range (inclusive). Leave empty for -Inf."
                          />
                          <Input {...field} placeholder="Min value" type="number" />
                          <FormErrorMessage>{getIn(form.errors, `subgroups.${index}.condition.min_value`)}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    <Field name={`subgroups.${index}.condition.max_value`}>
                      {({ field, form }: FieldProps) => (
                        <FormControl isInvalid={!!getIn(form.errors, `subgroups.${index}.condition.max_value`) && !!getIn(form.touched, `subgroups.${index}.condition.max_value`)}>
                          <TooltipLabel
                            label="Max Value"
                            tooltip="The maximum value of the range (inclusive). Leave empty for +Inf."
                          />
                          <Input {...field} placeholder="Max value" type="number" />
                          <FormErrorMessage>{getIn(form.errors, `subgroups.${index}.condition.max_value`)}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </HStack>
                )}
                {(subgroup.condition.type === 'contains' || ['year', 'month', 'day'].includes(subgroup.condition.type)) && (
                  <Field name={`subgroups.${index}.condition.value`}>
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!getIn(form.errors, `subgroups.${index}.condition.value`) && !!getIn(form.touched, `subgroups.${index}.condition.value`)}>
                        <TooltipLabel
                          label={subgroup.condition.type === 'contains' ? 'Contains' : subgroup.condition.type.charAt(0).toUpperCase() + subgroup.condition.type.slice(1)}
                          tooltip={subgroup.condition.type === 'contains' ? 'The value that the column should contain' : `The ${subgroup.condition.type} value to filter on (for timestamp columns)`}
                        />
                        <Input {...field} placeholder={`${subgroup.condition.type === 'contains' ? 'Contains value' : `${subgroup.condition.type} value`}`} type={['year', 'month', 'day'].includes(subgroup.condition.type) ? 'number' : 'text'} />
                        <FormErrorMessage>{getIn(form.errors, `subgroups.${index}.condition.value`)}</FormErrorMessage>
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
            onClick={() => push({ column: '', condition: { type: 'value', value: '' } })}
          >
            Add Subgroup
          </Button>
          {Array.isArray(errors.subgroups) && (
            <FormErrorMessage>{errors.subgroups.join(', ')}</FormErrorMessage>
          )}
          {values.subgroups.length === 0 && (
            <Text color="orange.500" mt={2}>
              No subgroups defined. Add at least one subgroup for more detailed analysis.
            </Text>
          )}
        </FormControl>
      )}
    </FieldArray>
  );
};
