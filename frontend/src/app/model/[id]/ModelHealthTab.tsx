import { SimpleGrid, Box, Heading, Text, useColorModeValue } from '@chakra-ui/react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { getColor } from '../../utils/colorUtils'
import { getChartData, getChartOptions } from '../../utils/chartUtils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ModelHealthTabProps {
  modelHealth: number
  healthOverTime: number[]
  timePoints: string[]
}

export default function ModelHealthTab({ modelHealth, healthOverTime, timePoints }: ModelHealthTabProps) {
  const cardBgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const chartData = getChartData(timePoints, healthOverTime)
  const chartOptions = getChartOptions()

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
        <Heading as="h3" size="md" mb={4}>Current Model Health</Heading>
        <Text fontSize="4xl" fontWeight="bold" textAlign="center" mb={4}>{modelHealth}%</Text>
        <Box
          h="24px"
          w="100%"
          bg="gray.200"
          borderRadius="full"
          overflow="hidden"
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
        <Line data={chartData} options={chartOptions} />
      </Box>
    </SimpleGrid>
  )
}
