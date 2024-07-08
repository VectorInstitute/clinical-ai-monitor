import React, { useState, useEffect } from 'react'
import { SimpleGrid, Box, Heading, Text, useColorModeValue, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useToast } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { getColor } from '../utils/color'
import { getChartData, getChartOptions } from '../utils/chart'
import { ModelHealth, validateModelHealth } from '../types/health'
import { ErrorMessage } from '../components/error-message'
import { LoadingSpinner } from '../components/loading-spinner'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ModelHealthTabProps {
  modelId: string
}

const ModelHealthTab: React.FC<ModelHealthTabProps> = ({ modelId }) => {
  const [modelHealth, setModelHealth] = useState<ModelHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toast = useToast()
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')

  useEffect(() => {
    const fetchModelHealth = async () => {
      try {
        const response = await fetch(`/api/model/${modelId}/health`)
        if (!response.ok) {
          throw new Error('Failed to fetch model health')
        }
        const data = await response.json()
        const validatedData = validateModelHealth(data)
        setModelHealth(validatedData)
      } catch (error) {
        console.error('Error fetching model health:', error)
        setError('Failed to fetch model health data')
        toast({
          title: "Error",
          description: "Failed to fetch model health data",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchModelHealth()
  }, [modelId, toast])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!modelHealth) return null

  const chartData = getChartData(modelHealth.time_points, modelHealth.health_over_time)
  const chartOptions = getChartOptions()

  const healthChange = modelHealth.health_over_time[modelHealth.health_over_time.length - 1] - modelHealth.health_over_time[modelHealth.health_over_time.length - 2]

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={6} color={textColor}>
        Model Health Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Flex direction="column" justify="space-between">
          <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} mb={4}>
            <Heading as="h3" size="md" mb={4} color={textColor}>Current Model Health</Heading>
            <Stat>
              <StatLabel fontSize="lg">Health Score</StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" color={getColor(modelHealth.model_health)}>
                {modelHealth.model_health.toFixed(1)}%
              </StatNumber>
              <StatHelpText>
                <StatArrow type={healthChange >= 0 ? 'increase' : 'decrease'} />
                {Math.abs(healthChange).toFixed(1)}%
              </StatHelpText>
            </Stat>
            <Box
              h="24px"
              w="100%"
              bg="gray.200"
              borderRadius="full"
              overflow="hidden"
              mt={4}
            >
              <Box
                h="100%"
                w={`${modelHealth.model_health}%`}
                bg={getColor(modelHealth.model_health)}
                transition="width 0.5s ease-in-out"
              />
            </Box>
          </Box>
          <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
            <Heading as="h3" size="md" mb={4} color={textColor}>Recommended action</Heading>
            <Text color={textColor}>
              {modelHealth.model_health >= 80 ? 'Your model is performing well. Keep monitoring for any changes.' :
               modelHealth.model_health >= 60 ? 'Your model health is good, but there\'s room for improvement.' :
               'Your model health needs attention. Consider retraining or adjusting your model.'}
            </Text>
          </Box>
        </Flex>
        <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
          <Heading as="h3" size="md" mb={4} color={textColor}>Model Health Over Time</Heading>
          <Line data={chartData} options={chartOptions} />
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default ModelHealthTab
