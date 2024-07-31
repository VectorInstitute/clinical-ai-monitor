import React, { useState, useEffect, useCallback } from 'react';
import { Box, Heading, Text, useColorModeValue, Flex, SimpleGrid, Badge, List, ListItem, ListIcon, Stat, StatLabel, StatNumber, Tooltip } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { ModelSafety, SafetyMetric } from './types/safety';
import { ErrorMessage } from './components/error-message';
import { LoadingSpinner } from './components/loading-spinner';
import { formatDistanceToNow } from 'date-fns';

interface ModelSafetyTabProps {
  modelId: string;
}

const ModelSafetyTab: React.FC<ModelSafetyTabProps> = ({ modelId }) => {
  const [safetyData, setSafetyData] = useState<ModelSafety | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');

  const fetchModelSafety = useCallback(async () => {
    try {
      const response = await fetch(`/api/model/${modelId}/safety`);
      if (!response.ok) {
        throw new Error('Failed to fetch model safety data');
      }
      const data = await response.json();
      setSafetyData(data);
    } catch (error) {
      console.error('Error fetching model safety data:', error);
      setError('Failed to fetch model safety data');
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchModelSafety();
  }, [fetchModelSafety]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!safetyData) return null;

  const allSafetyCriteriaMet = safetyData.metrics.every(metric => metric.status === 'met');
  const lastEvaluatedDate = new Date(safetyData.last_evaluated)

  if (isNaN(lastEvaluatedDate.getTime())) {
    return <ErrorMessage message="Invalid last evaluated date received from the server" />;
  }

  const daysSinceLastEvaluation = Math.floor((new Date().getTime() - lastEvaluatedDate.getTime()) / (1000 * 3600 * 24))
  const isRecentlyEvaluated = daysSinceLastEvaluation <= 30;

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={6} color={textColor}>
        Model Safety Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Flex direction="column" justify="space-between">
          <SafetyStatusCard
            allSafetyCriteriaMet={allSafetyCriteriaMet}
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
        <SafetyMetricsCard
          metrics={safetyData.metrics}
          cardBgColor={cardBgColor}
          borderColor={borderColor}
          textColor={textColor}
        />
      </SimpleGrid>
    </Box>
  );
};

interface CardProps {
  cardBgColor: string;
  borderColor: string;
  textColor: string;
}

interface SafetyStatusCardProps extends CardProps {
  allSafetyCriteriaMet: boolean;
  isRecentlyEvaluated: boolean;
}

const SafetyStatusCard: React.FC<SafetyStatusCardProps> = ({ allSafetyCriteriaMet, isRecentlyEvaluated, cardBgColor, borderColor, textColor }) => {
  const tooltipLabel = !allSafetyCriteriaMet
    ? "One or more safety criteria have not been met. Check the Safety Evaluation Checklist for details."
    : !isRecentlyEvaluated
    ? "It has been too long since the last safety evaluation. The model needs to be re-evaluated."
    : "All safety criteria have been met and the model has been recently evaluated.";

  const statusColor = allSafetyCriteriaMet && isRecentlyEvaluated ? 'green' : 'red';
  const statusText = allSafetyCriteriaMet && isRecentlyEvaluated ? 'No warnings' : 'Warning';
  const StatusIcon = allSafetyCriteriaMet && isRecentlyEvaluated ? CheckCircleIcon : WarningIcon;

  return (
    <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} mb={4}>
      <Heading as="h3" size="md" mb={4} color={textColor}>Overall Status</Heading>
      <Tooltip label={tooltipLabel} placement="top" hasArrow>
        <Flex align="center" cursor="help">
          <Badge colorScheme={statusColor} fontSize="2xl" p={2} borderRadius="md">
            {statusText}
          </Badge>
          <StatusIcon color={`${statusColor}.500`} boxSize={8} ml={4} />
        </Flex>
      </Tooltip>
    </Box>
  );
};

interface LastEvaluatedCardProps extends CardProps {
  lastEvaluated: Date;
  isRecentlyEvaluated: boolean;
}

const LastEvaluatedCard: React.FC<LastEvaluatedCardProps> = ({ lastEvaluated, isRecentlyEvaluated, cardBgColor, borderColor, textColor }) => {
  return (
    <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} mb={4}>
      <Heading as="h3" size="md" mb={4} color={textColor}>Last Evaluation</Heading>
      <Stat>
        <StatLabel>Time since last evaluation</StatLabel>
        <StatNumber>{formatDistanceToNow(lastEvaluated)} ago</StatNumber>
        <Flex align="center" mt={2}>
          <Badge colorScheme={isRecentlyEvaluated ? 'green' : 'red'} mr={2}>
            {isRecentlyEvaluated ? 'Recent' : 'Needs Re-evaluation'}
          </Badge>
          {isRecentlyEvaluated ? <CheckCircleIcon color="green.500" /> : <WarningIcon color="red.500" />}
        </Flex>
      </Stat>
    </Box>
  );
};

interface SafetyMetricsCardProps extends CardProps {
  metrics: SafetyMetric[];
}

const SafetyMetricsCard: React.FC<SafetyMetricsCardProps> = ({ metrics, cardBgColor, borderColor, textColor }) => (
  <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
    <Heading as="h3" size="md" mb={4} color={textColor}>Evaluation Checklist</Heading>
    <List spacing={3}>
      {metrics.map((metric, index) => (
        <ListItem key={index} display="flex" alignItems="center">
          <ListIcon
            as={metric.status === 'met' ? CheckCircleIcon : WarningIcon}
            color={metric.status === 'met' ? 'green.500' : 'red.500'}
          />
          <Text color={textColor}>{metric.name}: {metric.value.toFixed(2)} {metric.unit}</Text>
        </ListItem>
      ))}
    </List>
  </Box>
);

export default ModelSafetyTab;
