import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  Spinner,
  useToast,
  Button,
} from '@chakra-ui/react';
import { ModelFacts } from '../../../configure/types/facts';
import ModelHeader from './components/model-header';
import ModelSummary from './components/model-summary';
import ModelAccordion from './components/model-accordian';
import OtherInformationSection from './components/other-information-section';

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

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return (
      <Box textAlign="center">
        <Text color="red.500" mb={4}>{error}</Text>
        <Button onClick={fetchModelFacts} colorScheme="blue">Retry</Button>
      </Box>
    );
  }

  if (!modelFacts) {
    return (
      <Box textAlign="center">
        <Text mb={4}>No facts available for this model.</Text>
        <Button onClick={fetchModelFacts} colorScheme="blue">Refresh</Button>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
      <VStack align="stretch" spacing={6}>
        <ModelHeader name={modelFacts.name} version={modelFacts.version} type={modelFacts.type} />
        <ModelSummary summary={modelFacts.summary} />
        <Divider />
        <ModelAccordion modelFacts={modelFacts} />
        <Divider />
        <OtherInformationSection otherInfo={modelFacts.other_information} />
      </VStack>
    </Box>
  );
};

export default ModelFactsTab;
