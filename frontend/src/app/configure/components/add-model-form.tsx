import React from 'react';
import { Formik, Form } from 'formik';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
} from '@chakra-ui/react';
import { useEndpointContext } from '../../context/endpoint';
import { ModelFacts } from '../../model/[id]/types/facts';
import { modelValidationSchema, ModelFactsFormData } from '../types/model-validation';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import ModelFormFields from './model-form-fields';

interface AddModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  endpointName: string;
}

const AddModelForm: React.FC<AddModelFormProps> = ({ isOpen, onClose, endpointName }) => {
  const { addModelToEndpoint } = useEndpointContext();

  const initialValues: ModelFactsFormData = {
    name: '',
    version: '',
    type: '',
    intended_use: '',
    target_population: '',
    input_data: [''],
    output_data: '',
    summary: '',
    mechanism_of_action: '',
    validation_and_performance: {
      internal_validation: '',
      external_validation: '',
      performance_in_subgroups: [''],
    },
    uses_and_directions: [''],
    warnings: [''],
    other_information: {
      approval_date: '',
      license: '',
      contact_information: '',
      publication_link: '',
    },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Model to Endpoint</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(modelValidationSchema)}
          onSubmit={async (values, actions) => {
            try {
              await addModelToEndpoint(endpointName, values as ModelFacts);
              onClose();
            } catch (error) {
              console.error('Error adding model:', error);
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <ModelFormFields values={values} errors={errors} touched={touched} />
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} type="submit" isLoading={isSubmitting}>
                  Add Model
                </Button>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default AddModelForm;
