'use client'

import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box minHeight="100vh" bg={bgColor} display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6} textAlign="center">
        <Heading as="h1" size="xl" color={textColor}>
          Unauthorized Access
        </Heading>
        <Text fontSize="lg" color={textColor}>
          You do not have permission to access this page.
        </Text>
        <Button colorScheme="blue" onClick={() => router.push('/home')}>
          Go to Home
        </Button>
      </VStack>
    </Box>
  );
};

export default UnauthorizedPage;
