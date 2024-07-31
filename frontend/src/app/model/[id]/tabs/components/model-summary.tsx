import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

interface ModelSummaryProps {
  summary: string;
}

const ModelSummary: React.FC<ModelSummaryProps> = ({ summary }) => (
  <Box>
    <Heading as="h3" size="md" mb={2}>Summary</Heading>
    <Text>{summary}</Text>
  </Box>
);

export default ModelSummary;
