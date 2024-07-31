import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  VStack,
} from '@chakra-ui/react';
import { InfoOutlineIcon, WarningIcon } from '@chakra-ui/icons';
import { ModelFacts } from '../types/facts';

interface ModelAccordionProps {
  modelFacts: ModelFacts;
}

const ModelAccordion: React.FC<ModelAccordionProps> = ({ modelFacts }) => (
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

export default ModelAccordion;
