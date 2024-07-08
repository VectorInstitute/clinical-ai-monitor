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
import { ServerConfigSchema } from '../types/configure';
import { MetricsSection } from './metrics-section';
import { SubgroupsSection } from './subgroups-section';
import { ServerInfoSection } from './server-info-section';

const initialValues = {
  server_name: '',
  model_name: '',
  model_description: '',
  metrics: [{ name: '', type: 'binary' }],
  subgroups: [],
};

interface CreateServerFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateServerForm: React.FC<CreateServerFormProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const router = useRouter();
  const { addModel } = useModelContext();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await fetch('/api/create_evaluation_server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create evaluation server');
      }

      await addModel(
        {
          name: values.model_name,
          description: values.model_description,
          serverName: values.server_name,
        },
        values.metrics,
        values.subgroups
      );

      toast({
        title: "Evaluation server created.",
        description: "Your new evaluation server has been successfully configured.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
      router.push('/home');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
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
        <ModalHeader>Create Evaluation Server</ModalHeader>
        <ModalCloseButton />
        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(ServerConfigSchema)}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <ModalBody>
                <VStack spacing={4}>
                  <ServerInfoSection />
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
                  Create Evaluation Server
                </Button>
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  );
};

export default CreateServerForm;
