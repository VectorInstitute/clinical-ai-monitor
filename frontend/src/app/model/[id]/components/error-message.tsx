import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Box textAlign="center" py={10}>
      <Heading as="h3" size="lg" color="red.500">
        Error
      </Heading>
      <Text mt={4}>{message}</Text>
    </Box>
  );
};
