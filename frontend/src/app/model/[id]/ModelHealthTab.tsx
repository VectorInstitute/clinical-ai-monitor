import React from 'react'
import { SimpleGrid, Box, Heading, Text, useColorModeValue, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { getColor } from './utils/colorUtils'
import { getChartData, getChartOptions } from './utils/chartUtils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ModelHealthTabProps {
  modelHealth: number
  healthOverTime: number[]
  timePoints: string[]
}

const ModelHealthTab: React.FC<ModelHealthTabProps> = ({ modelHealth, healthOverTime, timePoints }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')

  const chartData = React.useMemo(() => getChartData(timePoints, healthOverTime), [timePoints, healthOverTime])
  const chartOptions = React.useMemo(() => getChartOptions(), [])

  const healthChange = healthOverTime[healthOverTime.length - 1] - healthOverTime[healthOverTime.length - 2]

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
              <StatNumber fontSize="4xl" fontWeight="bold" color={getColor(modelHealth)}>
                {modelHealth.toFixed(1)}%
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
                w={`${modelHealth}%`}
                bg={getColor(modelHealth)}
                transition="width 0.5s ease-in-out"
              />
            </Box>
          </Box>
          <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
            <Heading as="h3" size="md" mb={4} color={textColor}>Health Insights</Heading>
            <Text color={textColor}>
              {modelHealth >= 80 ? 'Your model is performing well. Keep monitoring for any changes.' :
               modelHealth >= 60 ? 'Your model health is good, but there\'s room for improvement.' :
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
