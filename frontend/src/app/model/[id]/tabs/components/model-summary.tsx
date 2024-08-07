import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

interface ModelSummaryProps {
  summary: string;
}

const ModelSummary: React.FC<ModelSummaryProps> = ({ summary }) => (
  <Box>
    <Heading as="h3" size="md" mb={3}>Summary</Heading>
    <Text fontSize="lg">{summary}</Text>
  </Box>
);

export default ModelSummary;
