import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  FormErrorMessage,
  Tooltip,
  Icon,
  HStack,
  Box,
  Text,
} from '@chakra-ui/react';
import { InfoIcon, AddIcon, MinusIcon } from '@chakra-ui/icons';
import { ModelFacts } from '../../model/[id]/tabs/types/facts';

interface ModelFactsFormProps {
  initialValues: ModelFacts;
  onSubmit: (values: ModelFacts) => Promise<void>;
}

const ModelFactsForm: React.FC<ModelFactsFormProps> = ({ initialValues, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, isSubmitting }) => (
        <Form>
          <VStack spacing={6} align="stretch">
            <FormControl isInvalid={!!errors.type && touched.type}>
              <FormLabel htmlFor="type">
                Type
                <Tooltip label="The type of the model. Example: 'Deep Learning Model'">
                  <Icon as={InfoIcon} ml={1} />
                </Tooltip>
              </FormLabel>
              <Field as={Select} id="type" name="type">
                <option value="">Select a type</option>
                <option value="Deep Learning Model">Deep Learning Model</option>
                <option value="Machine Learning Model">Machine Learning Model</option>
                <option value="Statistical Model">Statistical Model</option>
              </Field>
              <FormErrorMessage>{errors.type}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.intended_use && touched.intended_use}>
              <FormLabel htmlFor="intended_use">
                Intended Use
                <Tooltip label="Describe the intended use of the model. Example: 'Predict risk of readmission within 30 days'">
                  <Icon as={InfoIcon} ml={1} />
                </Tooltip>
              </FormLabel>
              <Field as={Textarea} id="intended_use" name="intended_use" />
              <FormErrorMessage>{errors.intended_use}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.target_population && touched.target_population}>
              <FormLabel htmlFor="target_population">
                Target Population
                <Tooltip label="Describe the target population for the model. Example: 'Adult patients (18+ years) admitted to the hospital'">
                  <Icon as={InfoIcon} ml={1} />
                </Tooltip>
              </FormLabel>
              <Field as={Input} id="target_population" name="target_population" />
              <FormErrorMessage>{errors.target_population}</FormErrorMessage>
            </FormControl>

            <FieldArray name="input_data">
              {(arrayHelpers) => (
                <Box>
                  <FormLabel>
                    Input Data
                    <Tooltip label="List the required input data for the model. Example: 'Patient age, gender, diagnosis codes'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  {values.input_data.map((_, index) => (
                    <HStack key={index} mt={2}>
                      <Field name={`input_data.${index}`} as={Input} />
                      <Button
                        onClick={() => arrayHelpers.remove(index)}
                        colorScheme="red"
                        size="sm"
                      >
                        <MinusIcon />
                      </Button>
                    </HStack>
                  ))}
                  <Button
                    onClick={() => arrayHelpers.push('')}
                    leftIcon={<AddIcon />}
                    mt={2}
                  >
                    Add Input Data
                  </Button>
                </Box>
              )}
            </FieldArray>

            <FormControl isInvalid={!!errors.output_data && touched.output_data}>
              <FormLabel htmlFor="output_data">
                Output Data
                <Tooltip label="Describe the output data produced by the model. Example: 'Probability of readmission (0-1)'">
                  <Icon as={InfoIcon} ml={1} />
                </Tooltip>
              </FormLabel>
              <Field as={Input} id="output_data" name="output_data" />
              <FormErrorMessage>{errors.output_data}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.summary && touched.summary}>
              <FormLabel htmlFor="summary">
                Summary
                <Tooltip label="Provide a brief summary of the model. Example: 'This model predicts the risk of hospital readmission within 30 days of discharge.'">
                  <Icon as={InfoIcon} ml={1} />
                </Tooltip>
              </FormLabel>
              <Field as={Textarea} id="summary" name="summary" />
              <FormErrorMessage>{errors.summary}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.mechanism_of_action && touched.mechanism_of_action}>
              <FormLabel htmlFor="mechanism_of_action">
                Mechanism of Action
                <Tooltip label="Describe how the model works. Example: 'The model uses a deep neural network to analyze patient data and identify patterns associated with readmission risk.'">
                  <Icon as={InfoIcon} ml={1} />
                </Tooltip>
              </FormLabel>
              <Field as={Textarea} id="mechanism_of_action" name="mechanism_of_action" />
              <FormErrorMessage>{errors.mechanism_of_action}</FormErrorMessage>
            </FormControl>

            <Box>
              <Text fontWeight="bold">Validation and Performance</Text>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.validation_and_performance?.internal_validation && touched.validation_and_performance?.internal_validation}>
                  <FormLabel htmlFor="validation_and_performance.internal_validation">
                    Internal Validation
                    <Tooltip label="Describe the internal validation results. Example: 'AUC: 0.82 (95% CI: 0.80-0.84)'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  <Field name="validation_and_performance.internal_validation" as={Input} />
                  <FormErrorMessage>{errors.validation_and_performance?.internal_validation}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.validation_and_performance?.external_validation && touched.validation_and_performance?.external_validation}>
                  <FormLabel htmlFor="validation_and_performance.external_validation">
                    External Validation
                    <Tooltip label="Describe the external validation results. Example: 'AUC: 0.79 (95% CI: 0.77-0.81) at General Hospital'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  <Field name="validation_and_performance.external_validation" as={Input} />
                  <FormErrorMessage>{errors.validation_and_performance?.external_validation}</FormErrorMessage>
                </FormControl>

                <FieldArray name="validation_and_performance.performance_in_subgroups">
                  {(arrayHelpers) => (
                    <Box>
                      <FormLabel>
                        Performance in Subgroups
                        <Tooltip label="List the model's performance in different subgroups. Example: 'Similar performance across age groups, Slightly lower performance in female patients (AUC: 0.78)'">
                          <Icon as={InfoIcon} ml={1} />
                        </Tooltip>
                      </FormLabel>
                      {values.validation_and_performance.performance_in_subgroups.map((_, index) => (
                        <HStack key={index} mt={2}>
                          <Field name={`validation_and_performance.performance_in_subgroups.${index}`} as={Input} />
                          <Button
                            onClick={() => arrayHelpers.remove(index)}
                            colorScheme="red"
                            size="sm"
                          >
                            <MinusIcon />
                          </Button>
                        </HStack>
                      ))}
                      <Button
                        onClick={() => arrayHelpers.push('')}
                        leftIcon={<AddIcon />}
                        mt={2}
                      >
                        Add Subgroup Performance
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </VStack>
            </Box>

            <FieldArray name="uses_and_directions">
              {(arrayHelpers) => (
                <Box>
                  <FormLabel>
                    Uses and Directions
                    <Tooltip label="List the uses and directions for the model. Example: 'Use for adult patients (18+ years), Check risk score every 4 weeks'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  {values.uses_and_directions.map((_, index) => (
                    <HStack key={index} mt={2}>
                      <Field name={`uses_and_directions.${index}`} as={Input} />
                      <Button
                        onClick={() => arrayHelpers.remove(index)}
                        colorScheme="red"
                        size="sm"
                      >
                        <MinusIcon />
                      </Button>
                    </HStack>
                  ))}
                  <Button
                    onClick={() => arrayHelpers.push('')}
                    leftIcon={<AddIcon />}
                    mt={2}
                  >
                    Add Use/Direction
                  </Button>
                </Box>
              )}
            </FieldArray>

            <FieldArray name="warnings">
              {(arrayHelpers) => (
                <Box>
                  <FormLabel>
                    Warnings
                    <Tooltip label="List any warnings or precautions for model use. Example: 'Not validated for use in pediatric patients, Model performance may degrade over time'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  {values.warnings.map((_, index) => (
                    <HStack key={index} mt={2}>
                      <Field name={`warnings.${index}`} as={Input} />
                      <Button
                        onClick={() => arrayHelpers.remove(index)}
                        colorScheme="red"
                        size="sm"
                      >
                        <MinusIcon />
                      </Button>
                    </HStack>
                  ))}
                  <Button
                    onClick={() => arrayHelpers.push('')}
                    leftIcon={<AddIcon />}
                    mt={2}
                  >
                    Add Warning
                  </Button>
                </Box>
              )}
            </FieldArray>

            <Box>
              <Text fontWeight="bold">Other Information</Text>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.other_information?.approval_date && touched.other_information?.approval_date}>
                  <FormLabel htmlFor="other_information.approval_date">
                    Approval Date
                    <Tooltip label="Enter the date when the model was approved. Format: YYYY-MM-DD">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  <Field name="other_information.approval_date" as={Input} type="date" />
                  <FormErrorMessage>{errors.other_information?.approval_date}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.other_information?.license && touched.other_information?.license}>
                  <FormLabel htmlFor="other_information.license">
                    License
                    <Tooltip label="Enter the license information for the model. Example: 'MIT License'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  <Field name="other_information.license" as={Input} />
                  <FormErrorMessage>{errors.other_information?.license}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.other_information?.contact_information && touched.other_information?.contact_information}>
                  <FormLabel htmlFor="other_information.contact_information">
                    Contact Information
                    <Tooltip label="Enter contact information for model support. Example: 'modelteam@hospital.org'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  <Field name="other_information.contact_information" as={Input} />
                  <FormErrorMessage>{errors.other_information?.contact_information}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.other_information?.publication_link && touched.other_information?.publication_link}>
                  <FormLabel htmlFor="other_information.publication_link">
                    Publication Link (Optional)
                    <Tooltip label="Enter the URL of the related publication. Example: 'https://doi.org/10.1000/journal.article.2023'">
                      <Icon as={InfoIcon} ml={1} />
                    </Tooltip>
                  </FormLabel>
                  <Field name="other_information.publication_link" as={Input} />
                  <FormErrorMessage>{errors.other_information?.publication_link}</FormErrorMessage>
                </FormControl>
              </VStack>
            </Box>

            <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
              Save Model Facts
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default ModelFactsForm;
