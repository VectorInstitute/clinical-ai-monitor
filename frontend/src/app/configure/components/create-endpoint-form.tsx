import React from 'react';
import { Formik, Form } from 'formik';
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
} from '@chakra-ui/react';
import { useModelContext } from '../../context/model';
import { useRouter } from 'next/navigation';
import { EndpointConfigSchema } from '../types/configure';
import { MetricsSection } from './metrics-section';
import { SubgroupsSection } from './subgroups-section';
import { EndpointInfoSection } from './endpoint-info-section';

const initialValues = {
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

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
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
      if (error.message.includes('already exists')) {
        setFieldError('endpoint_name', 'Endpoint name already exists');
      } else {
        toast({
          title: "Error",
          description: error.message,
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
          {({ isSubmitting }) => (
            <Form>
              <ModalBody>
                <VStack spacing={4}>
                  <EndpointInfoSection />
                  <MetricsSection />
                  <SubgroupsSection />
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
