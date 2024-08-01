'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  useColorModeValue,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Text,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Sidebar from '../../components/sidebar';

interface EndpointLog {
  timestamp: string;
  action: string;
  details: string | null;
  endpoint_name: string;
}

export default function EndpointLogsPage() {
  const [logs, setLogs] = useState<EndpointLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/endpoint_logs');
        if (!response.ok) {
          throw new Error('Failed to fetch endpoint logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError('An error occurred while fetching endpoint logs');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box
        ml={{ base: 0, md: 60 }}
        p={{ base: 4, md: 8 }}
        w="full"
        transition="margin-left 0.3s"
      >
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color={textColor}>
            Endpoint Logs
          </Heading>
          {isLoading ? (
            <Flex justify="center" align="center" height="300px">
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : logs.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              No logs available at this time.
            </Alert>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <TableCaption>Endpoint Logs</TableCaption>
                <Thead>
                  <Tr bg={tableHeaderBg}>
                    <Th>Endpoint Name</Th>
                    <Th>Timestamp</Th>
                    <Th>Action</Th>
                    <Th>Details</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.map((log, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{log.endpoint_name}</Td>
                      <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                      <Td>{log.action}</Td>
                      <Td>{log.details || 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </VStack>
      </Box>
    </Flex>
  );
}
