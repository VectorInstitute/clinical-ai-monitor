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
import CreateEndpointForm from './components/create-endpoint-form';
import DeleteEndpointForm from './components/delete-endpoint-form';
import ConfigCard from './components/config-card';

const ConfigurationPage: React.FC = () => {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const router = useRouter();
  const hospitalName = "University Health Network"; // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  const configCards = [
    {
      title: "Create New Endpoint",
      description: "Set up a new model monitoring endpoint with custom metrics and subgroups.",
      icon: FiPlus,
      buttonText: "Create Endpoint",
      buttonColor: "blue",
      onClick: onCreateOpen,
    },
    {
      title: "Delete Existing Endpoint",
      description: "Remove a model monitoring endpoint that is no longer needed.",
      icon: FiTrash2,
      buttonText: "Delete Endpoint",
      buttonColor: "red",
      onClick: onDeleteOpen,
    },
    {
      title: "View Endpoint Logs",
      description: "Check logs and statistics for your evaluation endpoints.",
      icon: FiList,
      buttonText: "View Logs",
      buttonColor: "green",
      onClick: () => router.push('/configure/logs'),
    },
  ];

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
              Configure Monitoring Endpoints
            </Heading>
            <Tooltip label="Manage your model monitoring endpoints here" placement="top">
              <Icon as={FiInfo} color={textColor} boxSize={6} />
            </Tooltip>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {configCards.map((card, index) => (
              <ConfigCard key={index} {...card} />
            ))}
          </SimpleGrid>
        </VStack>
      </Box>
      <CreateEndpointForm isOpen={isCreateOpen} onClose={onCreateClose} />
      <DeleteEndpointForm isOpen={isDeleteOpen} onClose={onDeleteClose} />
    </Flex>
  );
}

export default ConfigurationPage;
