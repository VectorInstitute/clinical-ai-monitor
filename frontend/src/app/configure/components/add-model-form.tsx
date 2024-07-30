import React from 'react';
import { Formik, Form, Field } from 'formik';
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
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useEndpointContext } from '../../context/endpoint';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface AddModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  endpointName: string;
}

const modelSchema = z.object({
  name: z.string().nonempty('Required'),
  version: z.string().nonempty('Required'),
});

type ModelFormData = z.infer<typeof modelSchema>;

const AddModelForm: React.FC<AddModelFormProps> = ({ isOpen, onClose, endpointName }) => {
  const { addModelToEndpoint } = useEndpointContext();

  const initialValues: ModelFormData = {
    name: '',
    version: '',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Model to Endpoint</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(modelSchema)}
          onSubmit={async (values, actions) => {
            try {
              await addModelToEndpoint(endpointName, values.name, values.version);
              onClose();
            } catch (error) {
              console.error('Error adding model:', error);
            } finally {
              actions.setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.name && touched.name}>
                    <FormLabel htmlFor="name">Model Name</FormLabel>
                    <Field as={Input} id="name" name="name" />
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.version && touched.version}>
                    <FormLabel htmlFor="version">Version</FormLabel>
                    <Field as={Input} id="version" name="version" />
                    <FormErrorMessage>{errors.version}</FormErrorMessage>
                  </FormControl>
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
