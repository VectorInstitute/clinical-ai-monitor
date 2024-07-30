import React from 'react'
import { Box, Heading, Text, useColorModeValue, Flex, SimpleGrid, Badge, List, ListItem, ListIcon, Stat, StatLabel, StatNumber, Tooltip } from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons'
import { ModelHealth, Metric } from '../types/health'
import { ErrorMessage } from '../components/error-message'
import { LoadingSpinner } from '../components/loading-spinner'
import { formatDistanceToNow } from 'date-fns'

interface ModelHealthTabProps {
  modelId: string;
}

const ModelHealthTab: React.FC<ModelHealthTabProps> = ({ modelId }) => {
  const [modelHealth, setModelHealth] = React.useState<ModelHealth | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const cardBgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')

  React.useEffect(() => {
    const fetchModelHealth = async () => {
      try {
        const response = await fetch(`/api/model/${modelId}/health`)
        if (!response.ok) {
          throw new Error('Failed to fetch model health')
        }
        const data = await response.json()
        setModelHealth(data)
      } catch (error) {
        console.error('Error fetching model health:', error)
        setError('Failed to fetch model health data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchModelHealth()
  }, [modelId])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!modelHealth) return null

  const allMetricsMet = modelHealth.metrics.every(metric => metric.status === 'met')
  const lastEvaluatedDate = new Date(modelHealth.last_evaluated)
  const daysSinceLastEvaluation = Math.floor((new Date().getTime() - lastEvaluatedDate.getTime()) / (1000 * 3600 * 24))
  const isRecentlyEvaluated = daysSinceLastEvaluation <= 30 // Consider "recent" if within the last month

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={6} color={textColor}>
        Model Safety Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Flex direction="column" justify="space-between">
          <OverallHealthCard
            allMetricsMet={allMetricsMet}
            isRecentlyEvaluated={isRecentlyEvaluated}
            cardBgColor={cardBgColor}
            borderColor={borderColor}
            textColor={textColor}
          />
          <LastEvaluatedCard
            lastEvaluated={lastEvaluatedDate}
            isRecentlyEvaluated={isRecentlyEvaluated}
            cardBgColor={cardBgColor}
            borderColor={borderColor}
            textColor={textColor}
          />
        </Flex>
        <MetricsCard
          metrics={modelHealth.metrics}
          cardBgColor={cardBgColor}
          borderColor={borderColor}
          textColor={textColor}
        />
      </SimpleGrid>
    </Box>
  )
}

interface CardProps {
  cardBgColor: string;
  borderColor: string;
  textColor: string;
}

interface OverallHealthCardProps extends CardProps {
  allMetricsMet: boolean;
  isRecentlyEvaluated: boolean;
}

const OverallHealthCard: React.FC<OverallHealthCardProps> = ({ allMetricsMet, isRecentlyEvaluated, cardBgColor, borderColor, textColor }) => {
  const tooltipLabel = !allMetricsMet
    ? "One or more evaluation criteria have not been met. Check the Evaluation Checklist for details."
    : !isRecentlyEvaluated
    ? "It has been too long since the last evaluation. The model needs to be re-evaluated."
    : "All evaluation criteria have been met and the model has been recently evaluated.";

  return (
    <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} mb={4}>
      <Heading as="h3" size="md" mb={4} color={textColor}>Overall Status</Heading>
      <Tooltip label={tooltipLabel} placement="top" hasArrow>
        <Flex align="center" cursor="help">
          <Badge colorScheme={allMetricsMet && isRecentlyEvaluated ? 'green' : 'red'} fontSize="2xl" p={2} borderRadius="md">
            {allMetricsMet && isRecentlyEvaluated ? 'No warnings' : 'Warning'}
          </Badge>
          {allMetricsMet && isRecentlyEvaluated ? (
            <CheckCircleIcon color="green.500" boxSize={8} ml={4} />
          ) : (
            <WarningIcon color="red.500" boxSize={8} ml={4} />
          )}
        </Flex>
      </Tooltip>
    </Box>
  )
}

interface LastEvaluatedCardProps extends CardProps {
  lastEvaluated: Date;
  isRecentlyEvaluated: boolean;
}

const LastEvaluatedCard: React.FC<LastEvaluatedCardProps> = ({ lastEvaluated, isRecentlyEvaluated, cardBgColor, borderColor, textColor }) => (
  <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} mb={4}>
    <Heading as="h3" size="md" mb={4} color={textColor}>Last Evaluated</Heading>
    <Stat>
      <StatLabel>Time since last evaluation</StatLabel>
      <StatNumber>{formatDistanceToNow(lastEvaluated)} ago</StatNumber>
      <Flex align="center" mt={2}>
        <Badge colorScheme={isRecentlyEvaluated ? 'green' : 'red'} mr={2}>
          {isRecentlyEvaluated ? 'Recent' : 'Needs Re-evaluation'}
        </Badge>
        {isRecentlyEvaluated ? (
          <CheckCircleIcon color="green.500" />
        ) : (
          <WarningIcon color="red.500" />
        )}
      </Flex>
    </Stat>
  </Box>
)

interface MetricsCardProps extends CardProps {
  metrics: Metric[];
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metrics, cardBgColor, borderColor, textColor }) => (
  <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
    <Heading as="h3" size="md" mb={4} color={textColor}>Evaluation Checklist</Heading>
    <List spacing={3}>
      {metrics.map((metric, index) => (
        <ListItem key={index} display="flex" alignItems="center">
          <ListIcon as={metric.status === 'met' ? CheckCircleIcon : WarningIcon} color={metric.status === 'met' ? 'green.500' : 'red.500'} />
          <Text color={textColor}>{metric.name}: {metric.value.toFixed(2)} {metric.unit}</Text>
        </ListItem>
      ))}
    </List>
  </Box>
)

export default ModelHealthTab
