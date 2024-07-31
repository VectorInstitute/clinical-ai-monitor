import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  List,
  ListItem,
  ListIcon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { InfoOutlineIcon, WarningIcon } from '@chakra-ui/icons';
import { ModelFacts, OtherInformation } from '../types/facts';

interface ModelFactsTabProps {
  modelId: string;
}

const ModelFactsTab: React.FC<ModelFactsTabProps> = ({ modelId }) => {
  const [modelFacts, setModelFacts] = useState<ModelFacts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const fetchModelFacts = useCallback(async () => {
    try {
      const response = await fetch(`/api/models/${modelId}/facts`);
      if (!response.ok) {
        throw new Error('Failed to fetch model facts');
      }
      const data: ModelFacts = await response.json();
      setModelFacts(data);
    } catch (err) {
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

  if (!modelFacts) {
    return <Text color="red.500">Failed to load model facts</Text>;
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

const ModelHeader: React.FC<{ name: string; version: string; type: string }> = ({ name, version, type }) => (
  <Box>
    <Heading as="h2" size="xl" mb={2}>{name}</Heading>
    <Text fontSize="md" color="gray.500">Version {version} | {type}</Text>
  </Box>
);

const ModelSummary: React.FC<{ summary: string }> = ({ summary }) => (
  <Box>
    <Heading as="h3" size="md" mb={2}>Summary</Heading>
    <Text>{summary}</Text>
  </Box>
);

const ModelAccordion: React.FC<{ modelFacts: ModelFacts }> = ({ modelFacts }) => (
  <Accordion allowMultiple>
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Heading as="h3" size="md">Intended Use and Target Population</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text><strong>Intended Use:</strong> {modelFacts.intended_use}</Text>
        <Text><strong>Target Population:</strong> {modelFacts.target_population}</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Heading as="h3" size="md">Input and Output Data</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text><strong>Input Data:</strong></Text>
        <List spacing={2}>
          {modelFacts.input_data.map((item, index) => (
            <ListItem key={index}>
              <ListIcon as={InfoOutlineIcon} color="blue.500" />
              {item}
            </ListItem>
          ))}
        </List>
        <Text><strong>Output Data:</strong> {modelFacts.output_data}</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Heading as="h3" size="md">Mechanism of Action</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>{modelFacts.mechanism_of_action}</Text>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Heading as="h3" size="md">Validation and Performance</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack align="stretch" spacing={2}>
          <Text><strong>Internal Validation:</strong> {modelFacts.validation_and_performance.internal_validation}</Text>
          <Text><strong>External Validation:</strong> {modelFacts.validation_and_performance.external_validation}</Text>
          <Text><strong>Performance in Subgroups:</strong></Text>
          <List spacing={2}>
            {modelFacts.validation_and_performance.performance_in_subgroups.map((item, index) => (
              <ListItem key={index}>
                <ListIcon as={InfoOutlineIcon} color="blue.500" />
                {item}
              </ListItem>
            ))}
          </List>
        </VStack>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Heading as="h3" size="md">Uses and Directions</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <List spacing={2}>
          {modelFacts.uses_and_directions.map((item, index) => (
            <ListItem key={index}>
              <ListIcon as={InfoOutlineIcon} color="blue.500" />
              {item}
            </ListItem>
          ))}
        </List>
      </AccordionPanel>
    </AccordionItem>

    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Heading as="h3" size="md">Warnings</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <List spacing={2}>
          {modelFacts.warnings.map((warning, index) => (
            <ListItem key={index} color="red.500">
              <ListIcon as={WarningIcon} color="red.500" />
              {warning}
            </ListItem>
          ))}
        </List>
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

const OtherInformationSection: React.FC<{ otherInfo: OtherInformation }> = ({ otherInfo }) => (
  <Box>
    <Heading as="h3" size="md" mb={2}>Other Information</Heading>
    <VStack align="stretch" spacing={2}>
      <Text><strong>Approval Date:</strong> {otherInfo.approval_date}</Text>
      <Text><strong>License:</strong> {otherInfo.license}</Text>
      <Text><strong>Contact:</strong> {otherInfo.contact_information}</Text>
      {otherInfo.publication_link && (
        <Link color="blue.500" href={otherInfo.publication_link} isExternal>
          View Publication
        </Link>
      )}
    </VStack>
  </Box>
);

export default ModelFactsTab;
