'use client'

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Icon,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiInfo, FiList } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';
import CreateServerForm from './components/create-server-form';
import DeleteServerForm from './components/delete-server-form';
import ConfigCard from './components/config-card';

export default function ConfigurationPage() {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const router = useRouter();
  const hospitalName = "University Health Network"; // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar hospitalName={hospitalName} />
      <Box
        ml={{ base: 0, md: 60 }}
        p={{ base: 4, md: 8 }}
        w="full"
        transition="margin-left 0.3s"
      >
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1" size="xl" color={textColor}>
              Configure Monitoring Servers
            </Heading>
            <Tooltip label="Manage your model monitoring servers here" placement="top">
              <Icon as={FiInfo} color={textColor} boxSize={6} />
            </Tooltip>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <ConfigCard
              title="Create New Server"
              description="Set up a new model monitoring server with custom metrics and subgroups."
              icon={FiPlus}
              buttonText="Create Server"
              buttonColor="blue"
              onClick={onCreateOpen}
            />
            <ConfigCard
              title="Delete Existing Server"
              description="Remove a model monitoring server that is no longer needed."
              icon={FiTrash2}
              buttonText="Delete Server"
              buttonColor="red"
              onClick={onDeleteOpen}
            />
            <ConfigCard
              title="View Server Logs"
              description="Check logs and statistics for your evaluation servers."
              icon={FiList}
              buttonText="View Logs"
              buttonColor="green"
              onClick={() => router.push('/configure/logs')}
            />
          </SimpleGrid>
        </VStack>
      </Box>
      <CreateServerForm isOpen={isCreateOpen} onClose={onCreateClose} />
      <DeleteServerForm isOpen={isDeleteOpen} onClose={onDeleteClose} />
    </Flex>
  );
}
