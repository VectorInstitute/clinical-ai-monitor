import React from 'react';
import { Formik, Form, FieldArray } from 'formik';
import {
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Box,
  IconButton,
  Text,
  Flex,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Criterion, EvaluationFrequency } from '../../types/evaluation-criteria';

interface EvaluationCriteriaFormProps {
  initialValues: Criterion[];
  onSubmit: (criteria: Criterion[], frequency: EvaluationFrequency) => Promise<void>;
  availableMetrics: Array<{ name: string; display_name: string }>;
  initialEvaluationFrequency: EvaluationFrequency;
}

const EvaluationCriteriaForm: React.FC<EvaluationCriteriaFormProps> = ({
  initialValues,
  onSubmit,
  availableMetrics,
  initialEvaluationFrequency,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Formik
      initialValues={{
        criteria: initialValues,
        evaluationFrequency: initialEvaluationFrequency
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await onSubmit(values.criteria, values.evaluationFrequency);
        } catch (error) {
          console.error('Error submitting form:', error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form>
          <VStack spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
            <Text fontSize="xl" fontWeight="bold">Evaluation Criteria</Text>
            <Box>
              <Text fontWeight="bold" mb={2}>Evaluation Frequency</Text>
              <HStack>
                <NumberInput
                  value={values.evaluationFrequency.value}
                  onChange={(_, value) => setFieldValue('evaluationFrequency.value', value)}
                  min={1}
                  max={365}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Select
                  value={values.evaluationFrequency.unit}
                  onChange={(e) => setFieldValue('evaluationFrequency.unit', e.target.value)}
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </Select>
              </HStack>
            </Box>
            <FieldArray name="criteria">
              {({ push, remove }) => (
                <>
                  {values.criteria.map((criterion, index) => (
                    <Skeleton key={criterion.id || index} isLoaded={!isSubmitting}>
                      <Box p={4} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <FormControl>
                            <FormLabel>Metric</FormLabel>
                            <Select
                              value={criterion.metric_name}
                              onChange={(e) => {
                                const selected = availableMetrics.find(m => m.name === e.target.value);
                                setFieldValue(`criteria.${index}.metric_name`, selected?.name || '');
                                setFieldValue(`criteria.${index}.display_name`, selected?.display_name || '');
                              }}
                            >
                              <option value="">Select a metric</option>
                              {availableMetrics.map((metric) => (
                                <option key={metric.name} value={metric.name}>
                                  {metric.display_name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Operator</FormLabel>
                            <Select
                              value={criterion.operator}
                              onChange={(e) => setFieldValue(`criteria.${index}.operator`, e.target.value)}
                            >
                              <option value=">">Greater than</option>
                              <option value="<">Less than</option>
                              <option value="=">Equal to</option>
                              <option value=">=">Greater than or equal to</option>
                              <option value="<=">Less than or equal to</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel>Threshold</FormLabel>
                            <Input
                              type="number"
                              step="any"
                              value={criterion.threshold}
                              onChange={(e) => setFieldValue(`criteria.${index}.threshold`, parseFloat(e.target.value))}
                            />
                          </FormControl>
                        </SimpleGrid>
                        <Flex justifyContent="flex-end" mt={2}>
                          <IconButton
                            aria-label="Remove criterion"
                            icon={<FiMinus />}
                            onClick={() => remove(index)}
                            size="sm"
                          />
                        </Flex>
                      </Box>
                    </Skeleton>
                  ))}
                  <Button
                    leftIcon={<FiPlus />}
                    onClick={() => push({ metric_name: '', display_name: '', operator: '>', threshold: 0 })}
                    mt={4}
                  >
                    Add Criterion
                  </Button>
                </>
              )}
            </FieldArray>
            <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
              Save Criteria and Frequency
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default EvaluationCriteriaForm;
