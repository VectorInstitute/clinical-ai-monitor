'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Button,
  useToast,
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
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { useRouter, useParams } from 'next/navigation';
import { FiHome, FiSettings, FiClipboard } from 'react-icons/fi';
import { useModelContext } from '../../../context/model';
import EvaluationCriteriaForm from '../../components/evaluation-criteria-form';
import Sidebar from '../../../components/sidebar';
import { Criterion, EvaluationFrequency } from '../../../types/evaluation-criteria';
import { withAuth } from '../../../components/with-auth';

const EvaluationCriteriaPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;
  const { getModelById, fetchEvaluationCriteria, updateEvaluationCriteria, updateEvaluationFrequency } = useModelContext();
  const [model, setModel] = useState<any>(null);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluationFrequency, setEvaluationFrequency] = useState<EvaluationFrequency>({ value: 30, unit: 'days' });
  const [isLoading, setIsLoading] = useState(true);
  const [availableMetrics, setAvailableMetrics] = useState<Array<{ name: string; display_name: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const breadcrumbColor = useColorModeValue('gray.600', 'gray.400');

  const sidebarWidth = useBreakpointValue({ base: 0, md: 60 });
  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });

  const fetchPerformanceMetrics = useCallback(async (endpointName: string) => {
    try {
      const response = await fetch(`/api/performance_metrics/${endpointName}/${modelId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      const metricsData = await response.json();
      return metricsData.overview.metric_cards.metrics.map((name: string, index: number) => ({
        name,
        display_name: metricsData.overview.metric_cards.display_names[index]
      }));
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }, [modelId]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const modelData = await getModelById(modelId);
        if (!modelData) {
          throw new Error('Model not found');
        }
        setModel(modelData);
        setEvaluationFrequency(modelData.evaluation_frequency || { value: 30, unit: 'days' });
        const criteriaData = await fetchEvaluationCriteria(modelId);
        setCriteria(criteriaData);
        if (modelData.endpoints && modelData.endpoints.length > 0) {
          const metrics = await fetchPerformanceMetrics(modelData.endpoints[0]);
          setAvailableMetrics(metrics);
        } else {
          throw new Error('No endpoints found for this model');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [modelId, getModelById, fetchEvaluationCriteria, fetchPerformanceMetrics]);

  const handleSubmit = async (updatedCriteria: Criterion[], updatedFrequency: EvaluationFrequency) => {
    try {
      await updateEvaluationCriteria(modelId, updatedCriteria);
      await updateEvaluationFrequency(modelId, updatedFrequency);
      setCriteria(updatedCriteria);
      setEvaluationFrequency(updatedFrequency);
      toast({
        title: 'Success',
        description: 'Evaluation criteria and frequency updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating evaluation criteria and frequency:', error);
      toast({
        title: 'Error',
        description: 'Failed to update evaluation criteria and frequency',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
                <BreadcrumbLink href="#"><Icon as={FiClipboard} mr={1} /> Evaluation Criteria</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Card>
              <CardHeader>
                <Skeleton isLoaded={!isLoading}>
                  <Heading as="h1" size={headingSize} color={textColor}>
                    Evaluation Criteria: {model?.basic_info?.name || 'Loading...'}
                  </Heading>
                </Skeleton>
                <SkeletonText isLoaded={!isLoading} noOfLines={1} mt={2}>
                  <Text color={textColor} fontSize="md">
                    Version: {model?.basic_info?.version || 'Loading...'}
                  </Text>
                </SkeletonText>
              </CardHeader>
              <Divider />
              <CardBody bg={cardBgColor} borderRadius="lg">
                {isLoading ? (
                  <VStack spacing={4}>
                    <Skeleton height="40px" width="100%" />
                    <Skeleton height="100px" width="100%" />
                    <Skeleton height="100px" width="100%" />
                  </VStack>
                ) : error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertTitle mr={2}>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : availableMetrics.length > 0 ? (
                  <EvaluationCriteriaForm
                    initialValues={criteria.length > 0 ? criteria : []}
                    onSubmit={handleSubmit}
                    availableMetrics={availableMetrics}
                    initialEvaluationFrequency={evaluationFrequency}
                  />
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertTitle mr={2}>No Metrics Available</AlertTitle>
                    <AlertDescription>
                      Please ensure the model has been evaluated at least once.
                    </AlertDescription>
                  </Alert>
                )}
              </CardBody>
            </Card>

            <Flex justifyContent="space-between">
              <Button onClick={() => router.push('/configure')} size="lg" colorScheme="gray" leftIcon={<FiSettings />}>
                Back to Configuration
              </Button>
            </Flex>
          </VStack>
        </Container>
      </Box>
    </Flex>
  );
};

export default withAuth(EvaluationCriteriaPage);
