'use client'

import { useState, useEffect } from 'react'
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
  Center
} from '@chakra-ui/react'
import Sidebar from '../../components/sidebar'
import ModelHealthTab from './tabs/model-health'
import PerformanceMetricsTab from './tabs/performance-metrics'
import ModelFactsTab from './tabs/model-facts'
import { useModelContext } from '../../context/model'

interface Model {
  id: number;
  endpointName: string;
  // Add other model properties as needed
}

interface ModelDashboardProps {
  params: {
    id: string;
  };
}

export default function ModelDashboard({ params }: ModelDashboardProps): JSX.Element {
  const { models, isLoading } = useModelContext()
  const [model, setModel] = useState<Model | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)

  const hospitalName = "University Health Network" // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    if (!isLoading && models.length > 0) {
      const foundModel = models.find(m => m.id.toString() === params.id)
      setModel(foundModel || null)
      setIsModelLoading(false)
    }
  }, [models, params.id, isLoading])

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
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb="1em">
            <Tab>Model Health</Tab>
            <Tab>Performance Metrics</Tab>
            <Tab>Model Facts</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <ModelHealthTab modelId={params.id} />
            </TabPanel>
            <TabPanel>
              <PerformanceMetricsTab endpointName={model.endpointName} />
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
