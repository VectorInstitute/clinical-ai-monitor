import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

interface NoFactsDisplayProps {
  onRefresh: () => void;
}

const NoFactsDisplay: React.FC<NoFactsDisplayProps> = ({ onRefresh }) => (
  <Box textAlign="center">
    <Text mb={4}>No facts available for this model.</Text>
    <Button onClick={onRefresh} colorScheme="blue">Refresh</Button>
  </Box>
);

export default NoFactsDisplay;
