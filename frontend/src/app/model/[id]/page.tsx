'use client'
import { useState, useEffect } from 'react'
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Heading, useColorModeValue } from '@chakra-ui/react'
import Sidebar from '../../components/sidebar'
import ModelHealthTab from './tabs/model-health'
import PerformanceMetricsTab from './tabs/performance-metrics'
import ModelFactsTab from './tabs/model-facts'

export default function ModelDashboard({ params }: { params: { id: string } }) {
  const [modelHealth, setModelHealth] = useState(85)
  const hospitalName = "University Health Network" // This should come from your authentication state
  const [healthOverTime, setHealthOverTime] = useState<number[]>([])
  const [timePoints, setTimePoints] = useState<string[]>([])

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    // Simulate fetching health data over time
    const healthData = [65, 25, 80, 75, 85, 90, 85]
    setHealthOverTime(healthData)
    setModelHealth(healthData[healthData.length - 1])

    // Generate time points (for demonstration purposes)
    const currentDate = new Date()
    const timePoints = healthData.map((_, index) => {
      const date = new Date(currentDate.getTime() - (6 - index) * 7 * 24 * 60 * 60 * 1000)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    })
    setTimePoints(timePoints)
  }, [])

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
              <ModelHealthTab modelHealth={modelHealth} healthOverTime={healthOverTime} timePoints={timePoints} />
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
