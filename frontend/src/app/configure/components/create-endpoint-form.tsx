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
import { useEndpointContext } from '../../context/endpoint';
import { useRouter } from 'next/navigation';
import { EndpointConfigSchema, EndpointConfig } from '../../types/configure';
import { MetricsSection } from './metrics-section';
import { SubgroupsSection } from './subgroups-section';

const initialValues: EndpointConfig = {
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
  const { addEndpoint } = useEndpointContext();

  const handleSubmit = async (
    values: EndpointConfig,
    { setSubmitting, setFieldError }: FormikHelpers<EndpointConfig>
  ) => {
    try {
      if (values.metrics.length === 0) {
        setFieldError('metrics', 'At least one metric is required');
        return;
      }

      await addEndpoint({ metrics: values.metrics, subgroups: values.subgroups });

      toast({
        title: "Evaluation endpoint created.",
        description: "Your new evaluation endpoint has been successfully configured.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
      router.push('/configure');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
                  <MetricsSection />
                  <SubgroupsSection />
                  {Object.keys(errors).length > 0 && touched.metrics && (
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
