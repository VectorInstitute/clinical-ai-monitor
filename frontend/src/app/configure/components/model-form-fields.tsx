import React from 'react';
import { Field, FieldArray, FormikErrors, FormikTouched } from 'formik';
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
  VStack,
  HStack,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { ModelFacts } from '../types/facts';

interface ModelFormFieldsProps {
  values: ModelFacts;
  errors: FormikErrors<ModelFacts>;
  touched: FormikTouched<ModelFacts>;
}

const ModelFormFields: React.FC<ModelFormFieldsProps> = ({ values, errors, touched }) => {
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  };

  const renderField = (name: string, label: string, as: 'input' | 'textarea' | 'select' = 'input') => (
    <FormControl isInvalid={!!getNestedValue(errors, name) && !!getNestedValue(touched, name)}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      {as === 'select' ? (
        <Field as={Select} id={name} name={name}>
          <option value="">Select a type</option>
          <option value="Deep Learning Model">Deep Learning Model</option>
          <option value="Machine Learning Model">Machine Learning Model</option>
          <option value="Statistical Model">Statistical Model</option>
        </Field>
      ) : (
        <Field
          as={as === 'textarea' ? Textarea : Input}
          id={name}
          name={name}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      )}
      <FormErrorMessage>{getNestedValue(errors, name)}</FormErrorMessage>
    </FormControl>
  );

  const renderArrayField = (name: string, label: string) => (
    <FieldArray name={name}>
      {(arrayHelpers) => (
        <Box>
          <FormLabel>{label}</FormLabel>
          {(getNestedValue(values, name) || []).map((_: any, index: number) => (
            <HStack key={index} mt={2}>
              <Field
                as={Input}
                name={`${name}.${index}`}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              <IconButton
                aria-label={`Remove ${label}`}
                icon={<MinusIcon />}
                onClick={() => arrayHelpers.remove(index)}
              />
            </HStack>
          ))}
          <Button leftIcon={<AddIcon />} onClick={() => arrayHelpers.push('')} mt={2}>
            Add {label}
          </Button>
        </Box>
      )}
    </FieldArray>
  );

  return (
    <VStack spacing={4} align="stretch">
      {renderField('name', 'Model Name')}
      {renderField('version', 'Version')}
      {renderField('type', 'Type', 'select')}
      {renderField('intended_use', 'Intended Use', 'textarea')}
      {renderField('target_population', 'Target Population', 'textarea')}
      {renderArrayField('input_data', 'Input Data')}
      {renderField('output_data', 'Output Data')}
      {renderField('summary', 'Summary', 'textarea')}
      {renderField('mechanism_of_action', 'Mechanism of Action', 'textarea')}

      <Box>
        <Text fontWeight="bold">Validation and Performance</Text>
        {renderField('validation_and_performance.internal_validation', 'Internal Validation', 'textarea')}
        {renderField('validation_and_performance.external_validation', 'External Validation', 'textarea')}
        {renderArrayField('validation_and_performance.performance_in_subgroups', 'Performance in Subgroups')}
      </Box>

      {renderArrayField('uses_and_directions', 'Uses and Directions')}
      {renderArrayField('warnings', 'Warnings')}

      <Box>
        <Text fontWeight="bold">Other Information</Text>
        {renderField('other_information.approval_date', 'Approval Date')}
        {renderField('other_information.license', 'License')}
        {renderField('other_information.contact_information', 'Contact Information')}
        {renderField('other_information.publication_link', 'Publication Link (Optional)')}
      </Box>
    </VStack>
  );
};

export default ModelFormFields;
