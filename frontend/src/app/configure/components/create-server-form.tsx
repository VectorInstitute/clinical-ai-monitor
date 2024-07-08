import React from 'react';
import { Formik, Form, FieldArray, Field } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import {
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { useModelContext } from '../../context/model';
import { useRouter } from 'next/navigation';
import { ServerConfigSchema } from '../types/configure';

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

      if (!response.ok) {
        throw new Error('Failed to create evaluation server');
      }

      addModel({
        name: values.model_name,
        description: values.model_description,
        serverName: values.server_name,
      });

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
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Evaluation Server</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Formik
            initialValues={initialValues}
            validationSchema={toFormikValidationSchema(ServerConfigSchema)}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting }) => (
              <Form>
                <VStack spacing={6} align="stretch">
                  <FormControl isInvalid={errors.server_name && touched.server_name}>
                    <FormLabel htmlFor="server_name">Server Name</FormLabel>
                    <Field
                      as={Input}
                      id="server_name"
                      name="server_name"
                      placeholder="Enter server name"
                    />
                  </FormControl>

                  <FormControl isInvalid={errors.model_name && touched.model_name}>
                    <FormLabel htmlFor="model_name">Model Name</FormLabel>
                    <Field
                      as={Input}
                      id="model_name"
                      name="model_name"
                      placeholder="Enter model name"
                    />
                  </FormControl>

                  <FormControl isInvalid={errors.model_description && touched.model_description}>
                    <FormLabel htmlFor="model_description">Model Description</FormLabel>
                    <Field
                      as={Input}
                      id="model_description"
                      name="model_description"
                      placeholder="Enter model description"
                    />
                  </FormControl>

                  <FieldArray name="metrics">
                    {({ push, remove }) => (
                      <VStack align="stretch">
                        <Flex align="center">
                          <FormLabel mb={0}>Metrics</FormLabel>
                          <Tooltip label="Add metrics to evaluate your model's performance">
                            <InfoIcon ml={2} />
                          </Tooltip>
                        </Flex>
                        {values.metrics.map((_, index) => (
                          <Flex key={index} mb={2}>
                            <Field
                              as={Input}
                              name={`metrics.${index}.name`}
                              placeholder="Metric name"
                              mr={2}
                            />
                            <Field
                              as={Select}
                              name={`metrics.${index}.type`}
                              mr={2}
                            >
                              <option value="binary">Binary</option>
                              <option value="continuous">Continuous</option>
                            </Field>
                            <IconButton
                              aria-label="Remove metric"
                              icon={<DeleteIcon />}
                              onClick={() => remove(index)}
                            />
                          </Flex>
                        ))}
                        <Button
                          leftIcon={<AddIcon />}
                          onClick={() => push({ name: '', type: 'binary' })}
                        >
                          Add Metric
                        </Button>
                      </VStack>
                    )}
                  </FieldArray>

                  <FieldArray name="subgroups">
                    {({ push, remove }) => (
                      <VStack align="stretch">
                        <Flex align="center">
                          <FormLabel mb={0}>Subgroups</FormLabel>
                          <Tooltip label="Define subgroups to analyze model performance across different segments">
                            <InfoIcon ml={2} />
                          </Tooltip>
                        </Flex>
                        {values.subgroups.map((_, index) => (
                          <Flex key={index} mb={2}>
                            <Field
                              as={Input}
                              name={`subgroups.${index}.name`}
                              placeholder="Subgroup name"
                              mr={2}
                            />
                            <Field
                              as={Input}
                              name={`subgroups.${index}.condition.value`}
                              placeholder="Condition value"
                              mr={2}
                            />
                            <IconButton
                              aria-label="Remove subgroup"
                              icon={<DeleteIcon />}
                              onClick={() => remove(index)}
                            />
                          </Flex>
                        ))}
                        <Button
                          leftIcon={<AddIcon />}
                          onClick={() => push({ name: '', condition: { value: '' } })}
                        >
                          Add Subgroup
                        </Button>
                      </VStack>
                    )}
                  </FieldArray>
                </VStack>
                <ModalFooter>
                  <Button onClick={onClose} mr={3}>Cancel</Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isSubmitting}
                    loadingText="Creating..."
                  >
                    Create Evaluation Server
                  </Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateServerForm;
