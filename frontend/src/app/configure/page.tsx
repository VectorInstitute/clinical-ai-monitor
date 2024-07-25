'use client'

import React, { useState } from 'react';
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
  List,
  ListItem,
  Text,
  Button,
  Tag,
  Divider,
  Badge,
  Container,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiInfo, FiList } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/sidebar';
import CreateEndpointForm from './components/create-endpoint-form';
import DeleteEndpointForm from './components/delete-endpoint-form';
import AddModelForm from './components/add-model-form';
import RemoveModelForm from './components/remove-model-form';
import ConfigCard from './components/config-card';
import { useEndpointContext } from '../context/endpoint';

const ConfigurationPage: React.FC = () => {
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isAddModelOpen, onOpen: onAddModelOpen, onClose: onAddModelClose } = useDisclosure();
  const { isOpen: isRemoveModelOpen, onOpen: onRemoveModelOpen, onClose: onRemoveModelClose } = useDisclosure();
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const router = useRouter();
  const hospitalName = "University Health Network"; // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { endpoints } = useEndpointContext();

  const configCards = [
    {
      title: "Create New Endpoint",
      description: "Set up a new model monitoring endpoint with custom metrics.",
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
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading as="h1" size="xl" color={textColor}>
                Configure Monitoring Endpoints
              </Heading>
              <Tooltip label="Manage your model monitoring endpoints here" placement="top">
                <Box>
                  <Icon as={FiInfo} color={textColor} boxSize={6} cursor="pointer" />
                </Box>
              </Tooltip>
            </Flex>
            <Divider borderColor={borderColor} />
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {configCards.map((card, index) => (
                <ConfigCard key={index} {...card} />
              ))}
            </SimpleGrid>
            <Box>
              <Heading as="h2" size="lg" mb={4}>
                Existing Endpoints
              </Heading>
              <Divider borderColor={borderColor} mb={4} />
              <List spacing={4}>
                {endpoints.map((endpoint) => (
                  <ListItem
                    key={endpoint.name}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={borderColor}
                    bg={cardBgColor}
                    boxShadow="sm"
                    transition="all 0.2s"
                    _hover={{ boxShadow: "md" }}
                  >
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="start">
                      <VStack align="start" spacing={2} mb={{ base: 4, md: 0 }}>
                        <Text fontWeight="bold" fontSize="lg">Endpoint: {endpoint.name}</Text>
                        <Text fontSize="sm">
                          Metrics:
                          {endpoint.metrics.map((metric, index) => (
                            <Badge key={index} ml={1} colorScheme="purple">
                              {metric}
                            </Badge>
                          ))}
                        </Text>
                        <Flex wrap="wrap" gap={2}>
                          {endpoint.models.map((model) => (
                            <Tag
                              key={model}
                              colorScheme="blue"
                              size="sm"
                              cursor="pointer"
                              onClick={() => {
                                setSelectedEndpoint(endpoint.name);
                                setSelectedModel(model);
                                onRemoveModelOpen();
                              }}
                            >
                              {model}
                            </Tag>
                          ))}
                        </Flex>
                      </VStack>
                      <Flex mt={{ base: 2, md: 0 }}>
                        <Button
                          size="sm"
                          colorScheme="teal"
                          mr={2}
                          onClick={() => {
                            setSelectedEndpoint(endpoint.name);
                            onAddModelOpen();
                          }}
                        >
                          Add Model
                        </Button>
                      </Flex>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>
        </Container>
      </Box>
      <CreateEndpointForm isOpen={isCreateOpen} onClose={onCreateClose} />
      <DeleteEndpointForm isOpen={isDeleteOpen} onClose={onDeleteClose} />
      {selectedEndpoint && (
        <AddModelForm
          isOpen={isAddModelOpen}
          onClose={onAddModelClose}
          endpointName={selectedEndpoint}
        />
      )}
      {selectedEndpoint && selectedModel && (
        <RemoveModelForm
          isOpen={isRemoveModelOpen}
          onClose={onRemoveModelClose}
          endpointName={selectedEndpoint}
          modelName={selectedModel}
        />
      )}
    </Flex>
  );
}

export default ConfigurationPage;
