'use client'

import React, { useState, useEffect } from 'react'
import {
  Box, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Heading,
  useColorModeValue, Spinner, Center, useToast, Container,
  Divider, Badge, HStack, VStack, Icon, Skeleton
} from '@chakra-ui/react'
import { FiBox, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import Sidebar from '../../components/sidebar'
import ModelSafetyTab from './tabs/safety'
import PerformanceMetricsTab from './tabs/performance-metrics'
import ModelFactsTab from './tabs/facts'
import { useModelContext } from '../../context/model'
import { withAuth } from '../../components/with-auth'

interface ModelDashboardProps {
  params: {
    id: string;
  };
}

function ModelDashboard({ params }: ModelDashboardProps): JSX.Element {
  const { getModelById, isLoading: isContextLoading } = useModelContext()
  const [model, setModel] = useState<any | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    const fetchModel = async () => {
      if (isContextLoading) return
      try {
        const fetchedModel = await getModelById(params.id)
        setModel(fetchedModel)
      } catch (error) {
        toast({
          title: "Error fetching model",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsModelLoading(false)
      }
    }

    fetchModel()
  }, [params.id, getModelById, isContextLoading, toast])

  useEffect(() => {
    const storedTabIndex = localStorage.getItem(`activeTab-${params.id}`)
    if (storedTabIndex !== null) {
      setActiveTabIndex(parseInt(storedTabIndex, 10))
    }
  }, [params.id])

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index)
    localStorage.setItem(`activeTab-${params.id}`, index.toString())
  }

  const getStatusColor = (status: string) => status === 'No warnings' ? 'green' : 'red'
  const getStatusIcon = (status: string) => status === 'No warnings' ? FiCheckCircle : FiAlertCircle

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box ml={{ base: 0, md: 60 }} p={{ base: 4, md: 8 }} w="full" transition="margin-left 0.3s">
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch">
            <Flex justifyContent="space-between" alignItems="center">
              <HStack spacing={4}>
                <Icon as={FiBox} boxSize={6} color={textColor} />
                <Skeleton isLoaded={!isModelLoading}>
                  <Heading as="h1" size="xl" color={textColor}>
                    {model?.basic_info.name || 'Loading...'}
                  </Heading>
                </Skeleton>
                <Skeleton isLoaded={!isModelLoading}>
                  <Badge colorScheme="blue" fontSize="md">v{model?.basic_info.version || '0.0'}</Badge>
                </Skeleton>
              </HStack>
              <Skeleton isLoaded={!isModelLoading}>
                <Badge colorScheme={getStatusColor(model?.overall_status)} p={2} borderRadius="md">
                  <HStack spacing={2}>
                    <Icon as={getStatusIcon(model?.overall_status)} />
                    <Box>{model?.overall_status || 'Loading...'}</Box>
                  </HStack>
                </Badge>
              </Skeleton>
            </Flex>
            <Divider borderColor={borderColor} />

            <Tabs
              variant="soft-rounded"
              colorScheme="blue"
              index={activeTabIndex}
              onChange={handleTabChange}
              isLazy
            >
              <TabList mb="1em">
                <Tab>Model Safety</Tab>
                <Tab>Performance Metrics</Tab>
                <Tab>Model Facts</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <ModelSafetyTab modelId={params.id} />
                </TabPanel>
                <TabPanel>
                  {model && <PerformanceMetricsTab endpointName={model.endpoints[0]} modelId={params.id} />}
                </TabPanel>
                <TabPanel>
                  <ModelFactsTab modelId={params.id} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Container>
      </Box>
    </Flex>
  )
}

export default withAuth(ModelDashboard)
