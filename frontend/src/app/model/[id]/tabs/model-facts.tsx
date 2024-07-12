import React from 'react';
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
} from '@chakra-ui/react';
import { InfoOutlineIcon, WarningIcon } from '@chakra-ui/icons';

interface ValidationAndPerformance {
  internalValidation: string;
  externalValidation: string;
  performanceInSubgroups: string;
}

interface OtherInformation {
  approvalDate: string;
  license: string;
  contactInformation: string;
  publicationLink: string;
}

interface ModelFacts {
  name: string;
  locale: string;
  version: string;
  summary: string;
  mechanismOfRiskScore: string;
  validationAndPerformance: ValidationAndPerformance;
  usesAndDirections: string[];
  warnings: string[];
  otherInformation: OtherInformation;
}

const modelFacts: ModelFacts = {
  name: "Pneumothorax Prediction Model",
  locale: "University Health Network",
  version: "1.0.0",
  summary: "This model predicts the risk of pneumothorax using chest x-rays.",
  mechanismOfRiskScore: "The model uses a deep learning algorithm that processes chest x-rays to predict the risk of pneumothorax.",
  validationAndPerformance: {
    internalValidation: "AUC: 0.85 (95% CI: 0.83-0.87)",
    externalValidation: "AUC: 0.82 (95% CI: 0.80-0.84) at Toronto General Hospital",
    performanceInSubgroups: "Similar performance across age and gender subgroups",
  },
  usesAndDirections: [
    "Use for adult patients (18+ years)",
    "Check risk score every 4 weeks",
    "High risk (>0.7): Consider immediate clinical assessment",
  ],
  warnings: [
    "Do not use for patients already diagnosed with pneumothorax",
    "Not validated for use in ICU settings",
    "Model performance may degrade over time - regular re-validation required",
  ],
  otherInformation: {
    approvalDate: "January 1, 2023",
    license: "MIT License",
    contactInformation: "support@example.com",
    publicationLink: "https://doi.org/10.1038/s41746-020-0253-3",
  },
};

const ModelFactsTab: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
      <VStack align="stretch" spacing={6}>
        <ModelHeader name={modelFacts.name} version={modelFacts.version} locale={modelFacts.locale} />
        <ModelSummary summary={modelFacts.summary} />
        <Divider />
        <ModelAccordion modelFacts={modelFacts} />
        <Divider />
        <OtherInformation otherInfo={modelFacts.otherInformation} />
      </VStack>
    </Box>
  );
};

const ModelHeader: React.FC<{ name: string; version: string; locale: string }> = ({ name, version, locale }) => (
  <Box>
    <Heading as="h2" size="xl" mb={2}>{name}</Heading>
    <Text fontSize="md" color="gray.500">Version {version} | {locale}</Text>
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
          <Heading as="h3" size="md">Mechanism of Risk Score Calculation</Heading>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Text>{modelFacts.mechanismOfRiskScore}</Text>
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
          <Text><strong>Internal Validation:</strong> {modelFacts.validationAndPerformance.internalValidation}</Text>
          <Text><strong>External Validation:</strong> {modelFacts.validationAndPerformance.externalValidation}</Text>
          <Text><strong>Performance in Subgroups:</strong> {modelFacts.validationAndPerformance.performanceInSubgroups}</Text>
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
          {modelFacts.usesAndDirections.map((item, index) => (
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

const OtherInformation: React.FC<{ otherInfo: OtherInformation }> = ({ otherInfo }) => (
  <Box>
    <Heading as="h3" size="md" mb={2}>Other Information</Heading>
    <VStack align="stretch" spacing={2}>
      <Text><strong>Approval Date:</strong> {otherInfo.approvalDate}</Text>
      <Text><strong>License:</strong> {otherInfo.license}</Text>
      <Text><strong>Contact:</strong> {otherInfo.contactInformation}</Text>
      <Link color="blue.500" href={otherInfo.publicationLink} isExternal>
        View Publication
      </Link>
    </VStack>
  </Box>
);

export default ModelFactsTab;
