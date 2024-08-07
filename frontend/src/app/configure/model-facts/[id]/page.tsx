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
  Divider,
  Container,
  Flex,
  useBreakpointValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import { useRouter, useParams } from 'next/navigation';
import { FiHome, FiSettings, FiFileText, FiSave } from 'react-icons/fi';
import ModelFactsForm from '../../components/model-facts-form';
import { useModelContext } from '../../../context/model';
import { ModelFacts } from '../../types/facts';
import Sidebar from '../../../components/sidebar';

const ModelFactsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getModelById, updateModelFacts } = useModelContext();
  const [model, setModel] = useState<{ name: string; version: string; facts: ModelFacts | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const breadcrumbColor = useColorModeValue('gray.600', 'gray.400');

  const sidebarWidth = useBreakpointValue({ base: 0, md: 60 });
  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });

  useEffect(() => {
    const fetchModel = async () => {
      if (id) {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedModel = await getModelById(id);
          if (fetchedModel) {
            setModel({
              name: fetchedModel.basic_info.name,
              version: fetchedModel.basic_info.version,
              facts: fetchedModel.facts
            });
          } else {
            setError("Model not found");
          }
        } catch (error) {
          console.error('Error fetching model:', error);
          setError("Unable to load model details");
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

  const handleSubmit = async (values: ModelFacts) => {
    if (!model) return;

    try {
      await updateModelFacts(id, values);
      setModel({ ...model, facts: values });
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
    return (
      <Flex h="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error || !model) {
    return (
      <Flex h="100vh" alignItems="center" justifyContent="center" direction="column">
        <Text fontSize="xl" mb={4}>{error || "Model not found"}</Text>
        <Button onClick={() => router.push('/configure')} colorScheme="blue">
          Back to Configuration
        </Button>
      </Flex>
    );
  }

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box ml={{ base: 0, md: sidebarWidth }} w="full" transition="margin-left 0.3s">
        <Container maxW="container.xl" py={containerPadding}>
          <VStack spacing={6} align="stretch">
            <Breadcrumb color={breadcrumbColor} fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
                  <Icon as={FiHome} mr={1} /> Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="/configure" onClick={(e) => { e.preventDefault(); router.push('/configure'); }}>
                  <Icon as={FiSettings} mr={1} /> Configure
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href="#"><Icon as={FiFileText} mr={1} /> Model Facts</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Card>
              <CardHeader>
                <Heading as="h1" size={headingSize} color={textColor}>
                  Model Facts: {model.name}
                </Heading>
                <Text color={textColor} fontSize="md" mt={2}>Version: {model.version}</Text>
              </CardHeader>
              <Divider />
              <CardBody bg={cardBgColor} borderRadius="lg">
                <ModelFactsForm initialValues={model.facts || {}} onSubmit={handleSubmit} />
              </CardBody>
            </Card>

            <Flex justifyContent="space-between">
              <Button onClick={() => router.push('/configure')} size="lg" colorScheme="gray" leftIcon={<FiSettings />}>
                Back to Configuration
              </Button>
              <Button
                onClick={() => document.getElementById('submit-form')?.click()}
                size="lg"
                colorScheme="blue"
                leftIcon={<FiSave />}
              >
                Save Model Facts
              </Button>
            </Flex>
          </VStack>
        </Container>
      </Box>
    </Flex>
  );
};

export default ModelFactsPage;
