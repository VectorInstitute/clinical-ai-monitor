import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  useToast,
  Button,
  useColorModeValue,
  Container,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { ModelFacts } from '../../../types/facts';
import ModelHeader from './components/model-header';
import ModelSummary from './components/model-summary';
import ModelAccordion from './components/model-accordian';
import OtherInformationSection from './components/other-information-section';
import { ErrorDisplay } from './components/error-display';
import NoFactsDisplay from './components/no-facts-display';

interface ModelFactsTabProps {
  modelId: string;
}

const ModelFactsTab: React.FC<ModelFactsTabProps> = ({ modelId }) => {
  const [modelFacts, setModelFacts] = useState<ModelFacts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchModelFacts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/models/${modelId}/facts`);
      if (!response.ok) {
        throw new Error('Failed to fetch model facts');
      }
      const data: ModelFacts | null = await response.json();
      setModelFacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Error fetching model facts",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [modelId, toast]);

  useEffect(() => {
    fetchModelFacts();
  }, [fetchModelFacts]);

  const renderContent = () => {
    if (error) return <ErrorDisplay error={error} onRetry={fetchModelFacts} />;
    if (!modelFacts) return <NoFactsDisplay onRefresh={fetchModelFacts} />;

    return (
      <VStack align="stretch" spacing={8}>
        <ModelHeader name={modelFacts.name} version={modelFacts.version} type={modelFacts.type} />
        <ModelSummary summary={modelFacts.summary} />
        <ModelAccordion modelFacts={modelFacts} />
        <OtherInformationSection otherInfo={modelFacts.other_information} />
      </VStack>
    );
  };

  return (
    <Container maxW="container.xl" p={0}>
      <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
        {isLoading ? (
          <VStack align="stretch" spacing={8}>
            <Skeleton height="60px" />
            <SkeletonText mt="4" noOfLines={4} spacing="4" />
            <Skeleton height="200px" />
            <Skeleton height="100px" />
          </VStack>
        ) : (
          renderContent()
        )}
      </Box>
    </Container>
  );
};

export default ModelFactsTab;
