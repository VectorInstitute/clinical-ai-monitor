import React from 'react';
import { Formik, Form, FormikHelpers } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import {
  Button,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from '@chakra-ui/react';
import { useModelContext } from '../../context/model';
import { useRouter } from 'next/navigation';
import { EndpointConfigSchema, EndpointConfig } from '../types/configure';
import { MetricsSection } from './metrics-section';
import { SubgroupsSection } from './subgroups-section';
import { EndpointInfoSection } from './endpoint-info-section';

const initialValues: EndpointConfig = {
  endpoint_name: '',
  model_name: '',
  model_description: '',
  metrics: [],
  subgroups: [],
};

interface CreateEndpointFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEndpointForm: React.FC<CreateEndpointFormProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const router = useRouter();
  const { addModel } = useModelContext();

  const handleSubmit = async (
    values: EndpointConfig,
    { setSubmitting, setFieldError }: FormikHelpers<EndpointConfig>
  ) => {
    try {
      if (values.metrics.length === 0) {
        setFieldError('metrics', 'At least one metric is required');
        return;
      }

      await addModel(
        {
          name: values.model_name,
          description: values.model_description,
          endpointName: values.endpoint_name,
        },
        values.metrics,
        values.subgroups
      );

      toast({
        title: "Evaluation endpoint created.",
        description: "Your new evaluation endpoint has been successfully configured.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
      router.push('/home');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        setFieldError('endpoint_name', 'Endpoint name already exists');
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Evaluation Endpoint</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(EndpointConfigSchema)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <ModalBody>
                <VStack spacing={4}>
                  <EndpointInfoSection />
                  <MetricsSection />
                  <SubgroupsSection />
                  {Object.keys(errors).length > 0 && touched.endpoint_name && (
                    <Text color="red.500">
                      Please fill in all required fields correctly before submitting.
                    </Text>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Create Evaluation Endpoint
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default CreateEndpointForm;
