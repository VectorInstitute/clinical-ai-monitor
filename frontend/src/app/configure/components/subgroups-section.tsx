import React from 'react';
import { FieldArray, Field } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  Flex,
  Button,
  VStack,
  Checkbox,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

export const SubgroupsSection: React.FC = () => (
  <FieldArray name="subgroups">
    {({ push, remove, form }) => (
      <FormControl>
        <FormLabel>Subgroups</FormLabel>
        {form.values.subgroups.map((_, index) => (
          <VStack key={index} spacing={2} align="stretch" mb={4}>
            <Field
              as={Input}
              name={`subgroups.${index}.name`}
              placeholder="Subgroup name"
            />
            <Field
              as={Input}
              name={`subgroups.${index}.condition.feature`}
              placeholder="Feature name (e.g. Age, BloodPressure)"
            />
            <Field
              as={Select}
              name={`subgroups.${index}.condition.type`}
              placeholder="Select condition type"
            >
              <option value="range">Range</option>
              <option value="value">Exact value</option>
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="day">Day</option>
              <option value="hour">Hour</option>
            </Field>
            {form.values.subgroups[index]?.condition?.type === 'range' && (
              <>
                <Field
                  as={Input}
                  name={`subgroups.${index}.condition.min_value`}
                  placeholder="Minimum value"
                  type="number"
                />
                <Field
                  as={Input}
                  name={`subgroups.${index}.condition.max_value`}
                  placeholder="Maximum value"
                  type="number"
                />
                <Field
                  as={Checkbox}
                  name={`subgroups.${index}.condition.min_inclusive`}
                >
                  Include minimum value
                </Field>
                <Field
                  as={Checkbox}
                  name={`subgroups.${index}.condition.max_inclusive`}
                >
                  Include maximum value
                </Field>
              </>
            )}
            {['value', 'year', 'month', 'day', 'hour'].includes(form.values.subgroups[index]?.condition?.type) && (
              <Field
                as={Input}
                name={`subgroups.${index}.condition.value`}
                placeholder="Value"
                type={['year', 'month', 'day', 'hour'].includes(form.values.subgroups[index]?.condition?.type) ? "number" : "text"}
              />
            )}
            <Field
              as={Checkbox}
              name={`subgroups.${index}.condition.negate`}
            >
              Negate condition
            </Field>
            <Field
              as={Checkbox}
              name={`subgroups.${index}.condition.keep_nulls`}
            >
              Keep null values
            </Field>
            <IconButton
              aria-label="Remove subgroup"
              icon={<DeleteIcon />}
              onClick={() => remove(index)}
            />
          </VStack>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => push({ name: '', condition: { feature: '', type: '' } })}
        >
          Add Subgroup
        </Button>
      </FormControl>
    )}
  </FieldArray>
);
