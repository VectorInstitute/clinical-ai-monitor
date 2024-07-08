'use client'
import { useState, useEffect } from 'react'
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Heading, useColorModeValue, useToast } from '@chakra-ui/react'
import Sidebar from '../../components/sidebar'
import ModelHealthTab from './tabs/model-health'
import PerformanceMetricsTab from './tabs/performance-metrics'
import ModelFactsTab from './tabs/model-facts'
import { ModelHealth, validateModelHealth } from './types/health'

export default function ModelDashboard({ params }: { params: { id: string } }) {
  const [modelHealth, setModelHealth] = useState<ModelHealth | null>(null)
  const hospitalName = "University Health Network" // This should come from your authentication state
  const toast = useToast()

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    const fetchModelHealth = async () => {
      try {
        const response = await fetch(`/api/model/${params.id}/health`)
        if (!response.ok) {
          throw new Error('Failed to fetch model health')
        }
        const data = await response.json()
        const validatedData = validateModelHealth(data)
        setModelHealth(validatedData)
      } catch (error) {
        console.error('Error fetching model health:', error)
        toast({
          title: "Error",
          description: "Failed to fetch model health data",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }

    fetchModelHealth()
  }, [params.id, toast])

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
              {modelHealth && (
                <ModelHealthTab
                  modelHealth={modelHealth.model_health}
                  healthOverTime={modelHealth.health_over_time}
                  timePoints={modelHealth.time_points}
                />
              )}
            </TabPanel>
            <TabPanel>
              <PerformanceMetricsTab />
            </TabPanel>
            <TabPanel>
              <ModelFactsTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  )
}
