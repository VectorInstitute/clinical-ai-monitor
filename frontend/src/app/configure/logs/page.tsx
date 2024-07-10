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
  Button,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Sidebar from '../../components/sidebar';

interface EndpointLog {
  id: string;
  endpoint_name: string;
  created_at: string;
  last_evaluated: string;
  evaluation_count: number;
}

const PAGE_SIZE = 10;

export default function EndpointLogsPage() {
  const [logs, setLogs] = useState<EndpointLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paginatedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar hospitalName="University Health Network" />
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
            <Text color="red.500">{error}</Text>
          ) : (
            <>
              <TableContainer>
                <Table variant="simple">
                  <TableCaption>Endpoint Logs and Statistics</TableCaption>
                  <Thead>
                    <Tr bg={tableHeaderBg}>
                      <Th>Endpoint Name</Th>
                      <Th>Created At</Th>
                      <Th>Last Evaluated</Th>
                      <Th isNumeric>Evaluation Count</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedLogs.map((log) => (
                      <Tr key={log.id}>
                        <Td>{log.endpoint_name}</Td>
                        <Td>{new Date(log.created_at).toLocaleString()}</Td>
                        <Td>{new Date(log.last_evaluated).toLocaleString()}</Td>
                        <Td isNumeric>{log.evaluation_count}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              <Flex justify="space-between" align="center" mt={4}>
                <Button
                  leftIcon={<FiChevronLeft />}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Text>
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  rightIcon={<FiChevronRight />}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  isDisabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </Flex>
            </>
          )}
        </VStack>
      </Box>
    </Flex>
  );
}
