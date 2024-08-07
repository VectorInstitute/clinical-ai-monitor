'use client'

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  Heading,
  useColorModeValue,
  Flex,
  SimpleGrid,
  useDisclosure,
  Container,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiList } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';
import CreateEndpointForm from './components/create-endpoint-form';
import DeleteEndpointForm from './components/delete-endpoint-form';
import AddModelToEndpointForm from './components/add-model-to-endpoint-form';
import RemoveModelFromEndpointForm from './components/remove-model-from-endpoint-form';
import ConfigCard from './components/config-card';
import EndpointCard from './components/endpoint-card';
import { useEndpointContext } from '../context/endpoint';
import { useModelContext } from '../context/model';

const ConfigurationPage: React.FC = () => {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isAddModelOpen, onOpen: onAddModelOpen, onClose: onAddModelClose } = useDisclosure();
  const { isOpen: isRemoveModelOpen, onOpen: onRemoveModelOpen, onClose: onRemoveModelClose } = useDisclosure();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const router = useRouter();
  const { endpoints } = useEndpointContext();
  const { models } = useModelContext();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isMobile = useBreakpointValue({ base: true, md: false });
  const sidebarWidth = 60; // Fixed sidebar width

  const configCards = useMemo(() => [
    {
      title: "Create New Endpoint",
      description: "Set up a new model monitoring endpoint with custom metrics.",
      icon: FiPlus,
      buttonText: "Create Endpoint",
      buttonColor: "green",
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
      buttonColor: "blue",
      onClick: () => router.push('/configure/logs'),
    },
  ], [onCreateOpen, onDeleteOpen, router]);

  const groupModelsByName = useCallback((modelIds: string[]) => {
    const groupedModels: { [key: string]: { version: string; id: string }[] } = {};
    modelIds.forEach(modelId => {
      const model = models.find(m => m.id === modelId);
      if (model) {
        if (!groupedModels[model.basic_info.name]) {
          groupedModels[model.basic_info.name] = [];
        }
        groupedModels[model.basic_info.name].push({
          version: model.basic_info.version,
          id: model.id
        });
      }
    });
    return groupedModels;
  }, [models]);

  const handleUpdateFacts = useCallback((modelId: string) => {
    if (modelId) {
      router.push(`/configure/model-facts/${modelId}`);
    } else {
      console.error('Invalid model ID for updating facts');
    }
  }, [router]);

  const handleRemoveModel = useCallback((endpointName: string) => {
    setSelectedEndpoint(endpointName);
    onRemoveModelOpen();
  }, [onRemoveModelOpen]);

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box ml={{ base: 0, md: sidebarWidth }} w="full" transition="margin-left 0.3s">
        <Container maxW="container.xl" px={{ base: 4, sm: 6, md: 8 }} py={8}>
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size={{ base: "lg", md: "xl" }} color={textColor} pb={4} borderBottom={`1px solid ${borderColor}`}>
              Configure Monitoring Endpoints
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {configCards.map((card, index) => (
                <ConfigCard key={index} {...card} />
              ))}
            </SimpleGrid>

            <Divider my={8} borderColor={borderColor} />

            <Heading as="h2" size={{ base: "md", md: "lg" }} color={textColor} pb={4} borderBottom={`1px solid ${borderColor}`}>
              Existing Endpoints
            </Heading>

            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
              {endpoints.map((endpoint) => {
                const groupedModels = groupModelsByName(endpoint.models);
                return (
                  <EndpointCard
                    key={endpoint.name}
                    endpoint={endpoint}
                    groupedModels={groupedModels}
                    onAddModel={() => {
                      setSelectedEndpoint(endpoint.name);
                      onAddModelOpen();
                    }}
                    onRemoveModel={() => handleRemoveModel(endpoint.name)}
                    onUpdateFacts={handleUpdateFacts}
                  />
                );
              })}
            </SimpleGrid>

            <CreateEndpointForm isOpen={isCreateOpen} onClose={onCreateClose} />
            <DeleteEndpointForm isOpen={isDeleteOpen} onClose={onDeleteClose} />
            {selectedEndpoint && (
              <AddModelToEndpointForm
                isOpen={isAddModelOpen}
                onClose={onAddModelClose}
                endpointName={selectedEndpoint}
              />
            )}
            {selectedEndpoint && (
              <RemoveModelFromEndpointForm
                isOpen={isRemoveModelOpen}
                onClose={onRemoveModelClose}
                endpointName={selectedEndpoint}
                models={endpoints.find(e => e.name === selectedEndpoint)?.models || []}
              />
            )}
          </VStack>
        </Container>
      </Box>
    </Flex>
  );
};

export default ConfigurationPage;
