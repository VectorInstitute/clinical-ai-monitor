'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  useColorModeValue,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import ModelFactsForm from '../../components/model-facts-form';
import { useModelContext } from '../../../context/model';

const ModelFactsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { getModelById, updateModelFacts } = useModelContext();
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    const fetchModel = async () => {
      if (id) {
        try {
          const fetchedModel = await getModelById(id as string);
          setModel(fetchedModel);
        } catch (error) {
          console.error('Error fetching model:', error);
          toast({
            title: "Error fetching model",
            description: "Unable to load model details",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchModel();
  }, [id, getModelById, toast]);

  const handleSubmit = async (values) => {
    try {
      await updateModelFacts(id as string, values);
      toast({
        title: "Model facts updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating model facts:', error);
      toast({
        title: "Error updating model facts",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!model) {
    return <Text>Model not found</Text>;
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color={textColor}>
          Model Facts: {model.name}
        </Heading>
        <Text color={textColor}>Version: {model.version}</Text>
        <ModelFactsForm initialValues={model.facts} onSubmit={handleSubmit} />
        <Button onClick={() => router.push('/configure')}>Back to Configuration</Button>
      </VStack>
    </Box>
  );
};

export default ModelFactsPage;
