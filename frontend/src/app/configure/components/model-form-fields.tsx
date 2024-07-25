import React from 'react';
import { Field, FieldArray } from 'formik';
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Box,
  Text,
  IconButton,
  Button,
  FormErrorMessage,
  Tooltip,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { ModelFactsFormData } from '../types/model-validation';

interface ModelFormFieldsProps {
  values: ModelFactsFormData;
  errors: any;
  touched: any;
}

const ModelFormFields: React.FC<ModelFormFieldsProps> = ({ values, errors, touched }) => {
  return (
    <VStack spacing={6} align="stretch">
      <FormControl isInvalid={!!errors.name && touched.name}>
        <Tooltip label="Enter the name of the model">
          <FormLabel>Model Name</FormLabel>
        </Tooltip>
        <Field name="name" as={Input} />
        <FormErrorMessage>{errors.name}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.version && touched.version}>
        <Tooltip label="Enter the version of the model">
          <FormLabel>Version</FormLabel>
        </Tooltip>
        <Field name="version" as={Input} />
        <FormErrorMessage>{errors.version}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.type && touched.type}>
        <Tooltip label="Select the type of the model">
          <FormLabel>Type</FormLabel>
        </Tooltip>
        <Field name="type" as={Select}>
          <option value="">Select a type</option>
          <option value="Deep Learning Model">Deep Learning Model</option>
          <option value="Machine Learning Model">Machine Learning Model</option>
          <option value="Statistical Model">Statistical Model</option>
        </Field>
        <FormErrorMessage>{errors.type}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.intended_use && touched.intended_use}>
        <Tooltip label="Describe the intended use of the model">
          <FormLabel>Intended Use</FormLabel>
        </Tooltip>
        <Field name="intended_use" as={Textarea} />
        <FormErrorMessage>{errors.intended_use}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.target_population && touched.target_population}>
        <Tooltip label="Describe the target population for the model">
          <FormLabel>Target Population</FormLabel>
        </Tooltip>
        <Field name="target_population" as={Input} />
        <FormErrorMessage>{errors.target_population}</FormErrorMessage>
      </FormControl>

      <FieldArray name="input_data">
        {(arrayHelpers) => (
          <Box>
            <Tooltip label="List the required input data for the model">
              <FormLabel>Input Data</FormLabel>
            </Tooltip>
            {values.input_data.map((_, index) => (
              <HStack key={index} mb={2}>
                <FormControl isInvalid={!!(errors.input_data && errors.input_data[index]) && touched.input_data}>
                  <Field name={`input_data.${index}`} as={Input} />
                  <FormErrorMessage>{errors.input_data && errors.input_data[index]}</FormErrorMessage>
                </FormControl>
                <IconButton
                  aria-label="Remove input data"
                  icon={<MinusIcon />}
                  onClick={() => arrayHelpers.remove(index)}
                />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={() => arrayHelpers.push('')} mt={2}>
              Add Input Data
            </Button>
          </Box>
        )}
      </FieldArray>

      <FormControl isInvalid={!!errors.output_data && touched.output_data}>
        <Tooltip label="Describe the output data produced by the model">
          <FormLabel>Output Data</FormLabel>
        </Tooltip>
        <Field name="output_data" as={Input} />
        <FormErrorMessage>{errors.output_data}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.summary && touched.summary}>
        <Tooltip label="Provide a brief summary of the model">
          <FormLabel>Summary</FormLabel>
        </Tooltip>
        <Field name="summary" as={Textarea} />
        <FormErrorMessage>{errors.summary}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.mechanism_of_action && touched.mechanism_of_action}>
        <Tooltip label="Describe the mechanism of action for the model">
          <FormLabel>Mechanism of Action</FormLabel>
        </Tooltip>
        <Field name="mechanism_of_action" as={Textarea} />
        <FormErrorMessage>{errors.mechanism_of_action}</FormErrorMessage>
      </FormControl>

      <Box>
        <Text fontWeight="bold" mb={2}>Validation and Performance</Text>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.validation_and_performance?.internal_validation && touched.validation_and_performance?.internal_validation}>
            <Tooltip label="Describe the internal validation results">
              <FormLabel>Internal Validation</FormLabel>
            </Tooltip>
            <Field name="validation_and_performance.internal_validation" as={Input} />
            <FormErrorMessage>{errors.validation_and_performance?.internal_validation}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.validation_and_performance?.external_validation && touched.validation_and_performance?.external_validation}>
            <Tooltip label="Describe the external validation results">
              <FormLabel>External Validation</FormLabel>
            </Tooltip>
            <Field name="validation_and_performance.external_validation" as={Input} />
            <FormErrorMessage>{errors.validation_and_performance?.external_validation}</FormErrorMessage>
          </FormControl>

          <FieldArray name="validation_and_performance.performance_in_subgroups">
            {(arrayHelpers) => (
              <Box>
                <Tooltip label="List the performance in different subgroups">
                  <FormLabel>Performance in Subgroups</FormLabel>
                </Tooltip>
                {values.validation_and_performance.performance_in_subgroups.map((_, index) => (
                  <HStack key={index} mb={2}>
                    <FormControl isInvalid={!!(errors.validation_and_performance?.performance_in_subgroups && errors.validation_and_performance.performance_in_subgroups[index]) && touched.validation_and_performance?.performance_in_subgroups}>
                      <Field name={`validation_and_performance.performance_in_subgroups.${index}`} as={Input} />
                      <FormErrorMessage>{errors.validation_and_performance?.performance_in_subgroups && errors.validation_and_performance.performance_in_subgroups[index]}</FormErrorMessage>
                    </FormControl>
                    <IconButton
                      aria-label="Remove subgroup performance"
                      icon={<MinusIcon />}
                      onClick={() => arrayHelpers.remove(index)}
                    />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => arrayHelpers.push('')} mt={2}>
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
            <Tooltip label="List the uses and directions for the model">
              <FormLabel>Uses and Directions</FormLabel>
            </Tooltip>
            {values.uses_and_directions.map((_, index) => (
              <HStack key={index} mb={2}>
                <FormControl isInvalid={!!(errors.uses_and_directions && errors.uses_and_directions[index]) && touched.uses_and_directions}>
                  <Field name={`uses_and_directions.${index}`} as={Input} />
                  <FormErrorMessage>{errors.uses_and_directions && errors.uses_and_directions[index]}</FormErrorMessage>
                </FormControl>
                <IconButton
                  aria-label="Remove use/direction"
                  icon={<MinusIcon />}
                  onClick={() => arrayHelpers.remove(index)}
                />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={() => arrayHelpers.push('')} mt={2}>
              Add Use/Direction
            </Button>
          </Box>
        )}
      </FieldArray>

      <FieldArray name="warnings">
        {(arrayHelpers) => (
          <Box>
            <Tooltip label="List any warnings or precautions for model use">
              <FormLabel>Warnings</FormLabel>
            </Tooltip>
            {values.warnings.map((_, index) => (
              <HStack key={index} mb={2}>
                <FormControl isInvalid={!!(errors.warnings && errors.warnings[index]) && touched.warnings}>
                  <Field name={`warnings.${index}`} as={Input} />
                  <FormErrorMessage>{errors.warnings && errors.warnings[index]}</FormErrorMessage>
                </FormControl>
                <IconButton
                  aria-label="Remove warning"
                  icon={<MinusIcon />}
                  onClick={() => arrayHelpers.remove(index)}
                />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={() => arrayHelpers.push('')} mt={2}>
              Add Warning
            </Button>
          </Box>
        )}
      </FieldArray>

      <Box>
        <Text fontWeight="bold" mb={2}>Other Information</Text>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.other_information?.approval_date && touched.other_information?.approval_date}>
            <Tooltip label="Enter the approval date of the model">
              <FormLabel>Approval Date</FormLabel>
            </Tooltip>
            <Field name="other_information.approval_date" as={Input} type="date" />
            <FormErrorMessage>{errors.other_information?.approval_date}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.other_information?.license && touched.other_information?.license}>
            <Tooltip label="Enter the license information for the model">
              <FormLabel>License</FormLabel>
            </Tooltip>
            <Field name="other_information.license" as={Input} />
            <FormErrorMessage>{errors.other_information?.license}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.other_information?.contact_information && touched.other_information?.contact_information}>
            <Tooltip label="Enter contact information for model support">
              <FormLabel>Contact Information</FormLabel>
            </Tooltip>
            <Field name="other_information.contact_information" as={Input} />
            <FormErrorMessage>{errors.other_information?.contact_information}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.other_information?.publication_link && touched.other_information?.publication_link}>
            <Tooltip label="Enter the URL of the related publication (optional)">
              <FormLabel>Publication Link (Optional)</FormLabel>
            </Tooltip>
            <Field name="other_information.publication_link" as={Input} />
            <FormErrorMessage>{errors.other_information?.publication_link}</FormErrorMessage>
          </FormControl>
        </VStack>
      </Box>
    </VStack>
  );
};

export default ModelFormFields;
