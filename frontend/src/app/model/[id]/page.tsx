'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Heading,
  useColorModeValue,
  Spinner,
  Center,
  useToast
} from '@chakra-ui/react'
import Sidebar from '../../components/sidebar'
import ModelHealthTab from './tabs/model-health'
import PerformanceMetricsTab from './tabs/performance-metrics'
import ModelFactsTab from './tabs/model-facts'
import { useModelContext } from '../../context/model'

interface ModelDashboardProps {
  params: {
    id: string;
  };
}

export default function ModelDashboard({ params }: ModelDashboardProps): JSX.Element {
  const { models, getModelById, isLoading } = useModelContext()
  const [model, setModel] = useState<any | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const toast = useToast()

  const hospitalName = "University Health Network" // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  const fetchModel = useCallback(async () => {
    if (isLoading) return
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
  }, [params.id, getModelById, isLoading, toast])

  useEffect(() => {
    fetchModel()
  }, [fetchModel])

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

  if (isLoading || isModelLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!model) {
    return (
      <Center h="100vh">
        <Heading as="h1" size="xl">Model not found</Heading>
      </Center>
    )
  }

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar hospitalName={hospitalName} />
      <Box ml={{ base: 0, md: 60 }} p={{ base: 4, md: 8 }} w="full" transition="margin-left 0.3s">
        <Heading as="h1" size="xl" mb={6} color={textColor}>
          Model Dashboard - ID: {params.id}
        </Heading>
        <Tabs
          variant="soft-rounded"
          colorScheme="blue"
          index={activeTabIndex}
          onChange={handleTabChange}
        >
          <TabList mb="1em">
            <Tab>Model Safety</Tab>
            <Tab>Performance Metrics</Tab>
            <Tab>Model Facts</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <ModelHealthTab modelId={params.id} />
            </TabPanel>
            <TabPanel>
              <PerformanceMetricsTab endpointName={model.endpoints[0]} modelId={params.id} />
            </TabPanel>
            <TabPanel>
              <ModelFactsTab modelId={params.id} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  )
}
