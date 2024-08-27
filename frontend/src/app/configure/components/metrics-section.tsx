import React from 'react';
import { FieldArray, Field, useFormikContext, FormikErrors } from 'formik';
import {
  FormControl,
  FormLabel,
  Select,
  IconButton,
  Flex,
  Button,
  Text,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const METRIC_NAMES = [
  "accuracy",
  "auroc",
  "average_precision",
  "f1_score",
  "mcc",
  "npv",
  "ppv",
  "precision",
  "recall",
  "tpr",
  "specificity",
  "sensitivity",
  "tnr"
];

const METRIC_TYPES = ['binary'];

interface Metric {
  name: string;
  type: string;
}

interface FormValues {
  metrics: Metric[];
}

export const MetricsSection: React.FC = () => {
  const { values, errors, touched } = useFormikContext<FormValues>();

  return (
    <FieldArray name="metrics">
      {({ push, remove }) => (
        <FormControl isInvalid={!!(errors.metrics && touched.metrics)}>
          <FormLabel>Metrics</FormLabel>
          <VStack align="stretch" spacing={2}>
            {values.metrics.map((metric, index) => (
              <Flex key={index}>
                <Field
                  as={Select}
                  name={`metrics.${index}.name`}
                  mr={2}
                  isInvalid={
                    errors.metrics &&
                    Array.isArray(errors.metrics) &&
                    (errors.metrics[index] as FormikErrors<Metric>)?.name
                  }
                >
                  <option value="">Select a metric name</option>
                  {METRIC_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Field>
                <Field
                  as={Select}
                  name={`metrics.${index}.type`}
                  mr={2}
                  isInvalid={
                    errors.metrics &&
                    Array.isArray(errors.metrics) &&
                    (errors.metrics[index] as FormikErrors<Metric>)?.type
                  }
                >
                  <option value="">Select a metric type</option>
                  {METRIC_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Field>
                <IconButton
                  aria-label="Remove metric"
                  icon={<DeleteIcon />}
                  onClick={() => remove(index)}
                />
              </Flex>
            ))}
            {errors.metrics && typeof errors.metrics === 'string' && (
              <FormErrorMessage>{errors.metrics}</FormErrorMessage>
            )}
          </VStack>
          <Button
            mt={2}
            leftIcon={<AddIcon />}
            onClick={() => push({ name: '', type: '' })}
          >
            Add Metric
          </Button>
          {values.metrics.length === 0 && (
            <Text color="red.500" mt={2}>
              At least one metric is required.
            </Text>
          )}
        </FormControl>
      )}
    </FieldArray>
  );
};
