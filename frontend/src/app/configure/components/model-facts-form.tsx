import React from 'react';
import { Formik, Form, FieldArray, Field } from 'formik';
import {
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Box,
  IconButton,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { ModelFacts, ValidationAndPerformance, OtherInformation } from '../types/facts';

interface ModelFactsFormProps {
  initialValues: Partial<ModelFacts>;
  onSubmit: (values: ModelFacts) => Promise<void>;
}

const ModelFactsForm: React.FC<ModelFactsFormProps> = ({ initialValues, onSubmit }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Formik
      initialValues={initialValues as ModelFacts}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, handleChange, handleBlur, isSubmitting }) => (
        <Form>
          <VStack spacing={8} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Input name="type" value={values.type} onChange={handleChange} onBlur={handleBlur} />
              </FormControl>
              <FormControl>
                <FormLabel>Intended Use</FormLabel>
                <Input name="intended_use" value={values.intended_use} onChange={handleChange} onBlur={handleBlur} />
              </FormControl>
              <FormControl>
                <FormLabel>Target Population</FormLabel>
                <Input name="target_population" value={values.target_population} onChange={handleChange} onBlur={handleBlur} />
              </FormControl>
              <FormControl>
                <FormLabel>Output Data</FormLabel>
                <Input name="output_data" value={values.output_data} onChange={handleChange} onBlur={handleBlur} />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Summary</FormLabel>
              <Textarea name="summary" value={values.summary} onChange={handleChange} onBlur={handleBlur} />
            </FormControl>

            <FormControl>
              <FormLabel>Mechanism of Action</FormLabel>
              <Textarea name="mechanism_of_action" value={values.mechanism_of_action} onChange={handleChange} onBlur={handleBlur} />
            </FormControl>

            <FieldArray name="input_data">
              {({ push, remove }) => (
                <Box>
                  <FormLabel>Input Data</FormLabel>
                  {values.input_data?.map((item, index) => (
                    <Flex key={index} mt={2}>
                      <Input
                        name={`input_data.${index}`}
                        value={item}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <IconButton
                        aria-label="Remove input data"
                        icon={<FiMinus />}
                        onClick={() => remove(index)}
                        ml={2}
                      />
                    </Flex>
                  ))}
                  <Button leftIcon={<FiPlus />} onClick={() => push('')} mt={2}>
                    Add Input Data
                  </Button>
                </Box>
              )}
            </FieldArray>

            <Box bg={bgColor} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={2}>Validation and Performance</Text>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel>Internal Validation</FormLabel>
                  <Input
                    name="validation_and_performance.internal_validation"
                    value={values.validation_and_performance?.internal_validation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>External Validation</FormLabel>
                  <Input
                    name="validation_and_performance.external_validation"
                    value={values.validation_and_performance?.external_validation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
                <FieldArray name="validation_and_performance.performance_in_subgroups">
                  {({ push, remove }) => (
                    <Box>
                      <FormLabel>Performance in Subgroups</FormLabel>
                      {values.validation_and_performance?.performance_in_subgroups?.map((item, index) => (
                        <Flex key={index} mt={2}>
                          <Input
                            name={`validation_and_performance.performance_in_subgroups.${index}`}
                            value={item}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                          <IconButton
                            aria-label="Remove subgroup performance"
                            icon={<FiMinus />}
                            onClick={() => remove(index)}
                            ml={2}
                          />
                        </Flex>
                      ))}
                      <Button leftIcon={<FiPlus />} onClick={() => push('')} mt={2}>
                        Add Subgroup Performance
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </VStack>
            </Box>

            <FieldArray name="uses_and_directions">
              {({ push, remove }) => (
                <Box>
                  <FormLabel>Uses and Directions</FormLabel>
                  {values.uses_and_directions?.map((item, index) => (
                    <Flex key={index} mt={2}>
                      <Input
                        name={`uses_and_directions.${index}`}
                        value={item}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <IconButton
                        aria-label="Remove use/direction"
                        icon={<FiMinus />}
                        onClick={() => remove(index)}
                        ml={2}
                      />
                    </Flex>
                  ))}
                  <Button leftIcon={<FiPlus />} onClick={() => push('')} mt={2}>
                    Add Use/Direction
                  </Button>
                </Box>
              )}
            </FieldArray>

            <FieldArray name="warnings">
              {({ push, remove }) => (
                <Box>
                  <FormLabel>Warnings</FormLabel>
                  {values.warnings?.map((item, index) => (
                    <Flex key={index} mt={2}>
                      <Input
                        name={`warnings.${index}`}
                        value={item}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <IconButton
                        aria-label="Remove warning"
                        icon={<FiMinus />}
                        onClick={() => remove(index)}
                        ml={2}
                      />
                    </Flex>
                  ))}
                  <Button leftIcon={<FiPlus />} onClick={() => push('')} mt={2}>
                    Add Warning
                  </Button>
                </Box>
              )}
            </FieldArray>

            <Box bg={bgColor} p={4} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={2}>Other Information</Text>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel>Approval Date</FormLabel>
                  <Input
                    name="other_information.approval_date"
                    value={values.other_information?.approval_date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>License</FormLabel>
                  <Input
                    name="other_information.license"
                    value={values.other_information?.license}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Contact Information</FormLabel>
                  <Input
                    name="other_information.contact_information"
                    value={values.other_information?.contact_information}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Publication Link</FormLabel>
                  <Input
                    name="other_information.publication_link"
                    value={values.other_information?.publication_link}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Button id="submit-form" type="submit" display="none" />
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default ModelFactsForm;
