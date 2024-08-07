import React from 'react';
import { Box, Heading, Text, Badge } from '@chakra-ui/react';

interface ModelHeaderProps {
  name: string;
  version: string;
  type: string;
}

const ModelHeader: React.FC<ModelHeaderProps> = ({ name, version, type }) => (
  <Box>
    <Heading as="h2" size="xl" mb={2}>{name}</Heading>
    <Text fontSize="md" color="gray.500">
      Version <Badge colorScheme="blue">{version}</Badge> | <Badge colorScheme="green">{type}</Badge>
    </Text>
  </Box>
);

export default ModelHeader;
