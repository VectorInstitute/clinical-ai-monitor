// app/model/[id]/page.tsx
'use client'
import { useState } from 'react'
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Progress, VStack } from '@chakra-ui/react'

export default function ModelDashboard({ params }: { params: { id: string } }) {
  const [modelHealth] = useState(85)

  return (
    <Box p={8}>
      <Text fontSize="2xl" mb={4}>Model Dashboard - ID: {params.id}</Text>
      <Tabs>
        <TabList>
          <Tab>Model Health</Tab>
          <Tab>Performance Metrics</Tab>
          <Tab>Model Facts</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={8} align="stretch">
              <Box textAlign="center">
                <Text fontSize="xl" mb={2}>Model Health</Text>
                <Progress value={modelHealth} size="lg" colorScheme="green" />
                <Text mt={2}>{modelHealth}%</Text>
              </Box>
              <Box>
                <Text fontSize="xl" mb={2}>Model Health Over Time</Text>
                {/* TODO: Implement bar chart for model health over time */}
                <Text>Bar chart placeholder</Text>
              </Box>
            </VStack>
          </TabPanel>
          <TabPanel>
            <Text>Performance Metrics (To be implemented)</Text>
          </TabPanel>
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="bold">Model Name:</Text>
                <Text>Example Model</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Summary:</Text>
                <Text>This is an example AI model for clinical use.</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Approval Date:</Text>
                <Text>January 1, 2023</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Uses and Directions:</Text>
                <Text>This model is used for...</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">License:</Text>
                <Text>MIT License</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Contact Information:</Text>
                <Text>support@example.com</Text>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
