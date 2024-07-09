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
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

export const MetricsSection: React.FC = () => (
  <FieldArray name="metrics">
    {({ push, remove, form }) => (
      <FormControl>
        <FormLabel>Metrics</FormLabel>
        {form.values.metrics.map((_, index) => (
          <Flex key={index} mb={2}>
            <Field
              as={Input}
              name={`metrics.${index}.name`}
              placeholder="Metric name"
              mr={2}
            />
            <Field
              as={Select}
              name={`metrics.${index}.type`}
              mr={2}
            >
              <option value="binary">Binary</option>
              <option value="continuous">Continuous</option>
            </Field>
            <IconButton
              aria-label="Remove metric"
              icon={<DeleteIcon />}
              onClick={() => remove(index)}
            />
          </Flex>
        ))}
        <Button
          leftIcon={<AddIcon />}
          onClick={() => push({ name: '', type: 'binary' })}
        >
          Add Metric
        </Button>
      </FormControl>
    )}
  </FieldArray>
);
