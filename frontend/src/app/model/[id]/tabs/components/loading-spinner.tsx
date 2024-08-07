import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

export const LoadingSpinner: React.FC = () => (
  <Box textAlign="center" py={10}>
    <Spinner size="xl" />
    <Text mt={4}>Loading data...</Text>
  </Box>
);
