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
  Tooltip,
  Divider,
  Badge,
  Container,
} from '@chakra-ui/react';
import Sidebar from '../../components/sidebar';
import { withAuth } from '../../components/with-auth';

interface EndpointLog {
  timestamp: string;
  action: string;
  details: Record<string, string> | null;
  endpoint_name: string;
}

function EndpointLogsPage() {
  const [logs, setLogs] = useState<EndpointLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const tableHeaderBg = useColorModeValue('gray.100', 'gray.700');
  const tableBorderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

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

  const renderDetails = (details: Record<string, string> | null) => {
    if (!details) return 'N/A';
    return Object.entries(details).map(([key, value]) => (
      <Text key={key} fontSize="sm">
        <strong>{key}:</strong> {value}
      </Text>
    ));
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box
        ml={{ base: 0, md: 60 }}
        p={{ base: 4, md: 8 }}
        w="full"
        transition="margin-left 0.3s"
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading as="h1" size="xl" color={textColor} mb={4}>
                Endpoint Logs
              </Heading>
              <Divider borderColor={tableBorderColor} />
            </Box>
            {isLoading ? (
              <Flex justify="center" align="center" height="300px">
                <Spinner size="xl" />
              </Flex>
            ) : error ? (
              <Alert status="error" variant="left-accent">
                <AlertIcon />
                {error}
              </Alert>
            ) : logs.length === 0 ? (
              <Alert status="info" variant="left-accent">
                <AlertIcon />
                No logs available at this time.
              </Alert>
            ) : (
              <TableContainer>
                <Table variant="simple" size="md">
                  <TableCaption placement="top">Recent Endpoint Activities</TableCaption>
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
                      <Tr
                        key={index}
                        _hover={{ bg: hoverBg }}
                        transition="background-color 0.2s"
                      >
                        <Td fontWeight="medium">{log.endpoint_name}</Td>
                        <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                        <Td>
                          <Badge colorScheme={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </Td>
                        <Td>
                          <Tooltip
                            label={JSON.stringify(log.details, null, 2)}
                            hasArrow
                            placement="top-start"
                            maxW="400px"
                          >
                            <Box>{renderDetails(log.details)}</Box>
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </VStack>
        </Container>
      </Box>
    </Flex>
  );
}

export default withAuth(EndpointLogsPage);
