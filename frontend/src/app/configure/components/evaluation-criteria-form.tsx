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
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { Criterion } from '../types/evaluation-criteria';

interface EvaluationCriteriaFormProps {
  initialValues: Criterion[];
  onSubmit: (criteria: Criterion[]) => Promise<void>;
  availableMetrics: Array<{ name: string; display_name: string }>;
}

const EvaluationCriteriaForm: React.FC<EvaluationCriteriaFormProps> = ({
  initialValues,
  onSubmit,
  availableMetrics,
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Formik
      initialValues={{ criteria: initialValues }}
      onSubmit={async (values) => {
        await onSubmit(values.criteria);
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form>
          <VStack spacing={6} align="stretch" bg={bgColor} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
            <Text fontSize="xl" fontWeight="bold">Evaluation Criteria</Text>
            <FieldArray name="criteria">
              {({ push, remove }) => (
                <>
                  {values.criteria.map((criterion, index) => (
                    <Box key={criterion.id || index} p={4} borderWidth={1} borderRadius="md" borderColor={borderColor}>
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
              Save Criteria
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default EvaluationCriteriaForm;
