import React, { useState } from 'react';
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
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FiPlus, FiMinus, FiChevronRight } from 'react-icons/fi';
import { ModelFacts } from '../../types/facts';

interface ModelFactsFormProps {
  initialValues: Partial<ModelFacts>;
  onSubmit: (values: ModelFacts) => Promise<void>;
}

const ModelFactsForm: React.FC<ModelFactsFormProps> = ({ initialValues, onSubmit }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const filledFieldBg = useColorModeValue('gray.100', 'gray.600');
  const editableFieldBg = useColorModeValue('white', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.800');

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const renderField = (name: string, label: string, as: string = 'input') => (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Field name={name}>
        {({ field, form }: any) => (
          <Box
            as={as === 'input' ? Input : Textarea}
            {...field}
            bg={field.value && focusedField !== name ? filledFieldBg : editableFieldBg}
            onFocus={() => setFocusedField(name)}
            onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              field.onBlur(e);
              setFocusedField(null);
            }}
          />
        )}
      </Field>
    </FormControl>
  );

  const renderArrayField = (name: string, label: string) => (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <Box>
          <Text fontWeight="bold" mb={2}>{label}</Text>
          <List spacing={3}>
            {(initialValues[name as keyof ModelFacts] as string[] || []).map((_, index) => (
              <ListItem key={index}>
                <Flex alignItems="center">
                  <ListIcon as={FiChevronRight} color="green.500" />
                  <Field name={`${name}.${index}`}>
                    {({ field, form }: any) => (
                      <Input
                        {...field}
                        bg={field.value && focusedField !== `${name}.${index}` ? filledFieldBg : editableFieldBg}
                        onFocus={() => setFocusedField(`${name}.${index}`)}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                          field.onBlur(e);
                          setFocusedField(null);
                        }}
                        flex={1}
                      />
                    )}
                  </Field>
                  <IconButton
                    aria-label={`Remove ${label}`}
                    icon={<FiMinus />}
                    onClick={() => remove(index)}
                    ml={2}
                  />
                </Flex>
              </ListItem>
            ))}
            <ListItem>
              <Button leftIcon={<FiPlus />} onClick={() => push('')} mt={2}>
                Add {label}
              </Button>
            </ListItem>
          </List>
        </Box>
      )}
    </FieldArray>
  );

  return (
    <Formik
      initialValues={initialValues as ModelFacts}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values }) => (
        <Form>
          <VStack spacing={8} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {renderField('type', 'Type')}
              {renderField('intended_use', 'Intended Use')}
              {renderField('target_population', 'Target Population')}
              {renderField('output_data', 'Output Data')}
            </SimpleGrid>

            {renderField('summary', 'Summary', 'textarea')}
            {renderField('mechanism_of_action', 'Mechanism of Action', 'textarea')}

            <Box bg={sectionBg} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={4} fontSize="lg">Input Data</Text>
              {renderArrayField('input_data', 'Input Data')}
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={4} fontSize="lg">Validation and Performance</Text>
              <VStack align="stretch" spacing={4}>
                {renderField('validation_and_performance.internal_validation', 'Internal Validation')}
                {renderField('validation_and_performance.external_validation', 'External Validation')}
                {renderArrayField('validation_and_performance.performance_in_subgroups', 'Performance in Subgroups')}
              </VStack>
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={4} fontSize="lg">Uses and Directions</Text>
              {renderArrayField('uses_and_directions', 'Use/Direction')}
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={4} fontSize="lg">Warnings</Text>
              {renderArrayField('warnings', 'Warning')}
            </Box>

            <Box bg={sectionBg} p={6} borderRadius="md" borderWidth={1} borderColor={borderColor}>
              <Text fontWeight="bold" mb={4} fontSize="lg">Other Information</Text>
              <VStack align="stretch" spacing={4}>
                {renderField('other_information.approval_date', 'Approval Date')}
                {renderField('other_information.license', 'License')}
                {renderField('other_information.contact_information', 'Contact Information')}
                {renderField('other_information.publication_link', 'Publication Link')}
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
