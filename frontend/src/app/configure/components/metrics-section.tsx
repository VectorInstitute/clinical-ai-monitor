import React from 'react';
import { FieldArray, Field, useFormikContext } from 'formik';
import {
  FormControl,
  FormLabel,
  Select,
  IconButton,
  Flex,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const METRIC_NAMES = [
  "accuracy",
  "auroc",
  "average_precision",
  "confusion_matrix",
  "f1_score",
  "fbeta_score",
  "mcc",
  "npv",
  "ppv",
  "precision",
  "recall",
  "tpr",
  "precision_recall_curve",
  "roc",
  "specificity",
  "tnr"
];

const METRIC_TYPES = ['binary', 'multilabel', 'multiclass'];

export const MetricsSection: React.FC = () => {
  const { values, errors } = useFormikContext<{ metrics: Array<{ name: string; type: string }> }>();

  return (
    <FieldArray name="metrics">
      {({ push, remove }) => (
        <FormControl>
          <FormLabel>Metrics</FormLabel>
          <VStack align="stretch" spacing={2}>
            {values.metrics.map((metric, index) => (
              <Flex key={index}>
                <Field
                  as={Select}
                  name={`metrics.${index}.name`}
                  mr={2}
                  isInvalid={errors.metrics && errors.metrics[index]?.name}
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
                  isInvalid={errors.metrics && errors.metrics[index]?.type}
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
              <Text color="red.500">{errors.metrics}</Text>
            )}
          </VStack>
          <Button
            mt={2}
            leftIcon={<AddIcon />}
            onClick={() => push({ name: '', type: '' })}
          >
            Add Metric
          </Button>
        </FormControl>
      )}
    </FieldArray>
  );
};
