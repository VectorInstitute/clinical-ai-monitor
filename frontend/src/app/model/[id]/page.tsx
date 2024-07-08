'use client'
import { useState } from 'react'
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Heading, useColorModeValue } from '@chakra-ui/react'
import Sidebar from '../../components/sidebar'
import ModelHealthTab from './tabs/model-health'
import PerformanceMetricsTab from './tabs/performance-metrics'
import ModelFactsTab from './tabs/model-facts'

export default function ModelDashboard({ params }: { params: { id: string } }) {
  const hospitalName = "University Health Network" // This should come from your authentication state

  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')

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
