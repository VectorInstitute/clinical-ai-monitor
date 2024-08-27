import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Badge,
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  Tooltip,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { ErrorMessage } from './components/error-display';
import { LoadingSpinner } from './components/loading-spinner';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { validateModelSafety, ModelSafety, Metric } from '../../../types/safety';

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
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch model safety data: ${response.statusText}`);
      }
      const data = await response.json();
      const validatedData = validateModelSafety(data);
      setSafetyData(validatedData);
    } catch (error) {
      console.error('Error fetching model safety data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
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

  const lastEvaluatedDate = parseISO(safetyData.last_evaluated);

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={6} color={textColor}>
        Model Safety Dashboard
      </Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <VStack spacing={4}>
          <SafetyStatusCard
            overallStatus={safetyData.overall_status}
            cardBgColor={cardBgColor}
            borderColor={borderColor}
            textColor={textColor}
          />
          <LastEvaluatedCard
            lastEvaluated={lastEvaluatedDate}
            isRecentlyEvaluated={safetyData.is_recently_evaluated}
            cardBgColor={cardBgColor}
            borderColor={borderColor}
            textColor={textColor}
          />
        </VStack>
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
  overallStatus: string;
}

const SafetyStatusCard: React.FC<SafetyStatusCardProps> = ({ overallStatus, cardBgColor, borderColor, textColor }) => {
  const tooltipLabel = overallStatus === 'No warnings'
    ? "All safety criteria have been met and the model has been recently evaluated."
    : "One or more safety criteria have not been met or the model needs re-evaluation. Check the Safety Evaluation Checklist for details.";

  const statusColor = overallStatus === 'No warnings' ? 'green' : 'red';
  const StatusIcon = overallStatus === 'No warnings' ? CheckCircleIcon : WarningIcon;

  return (
    <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} width="100%">
      <Heading as="h3" size="md" mb={4} color={textColor}>Overall Status</Heading>
      <Tooltip label={tooltipLabel} placement="top" hasArrow>
        <Flex align="center" cursor="help">
          <Badge colorScheme={statusColor} fontSize="xl" p={2} borderRadius="md">
            {overallStatus}
          </Badge>
          <StatusIcon color={`${statusColor}.500`} boxSize={6} ml={4} />
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
  const tooltipLabel = isRecentlyEvaluated
    ? "The model has been evaluated within the specified evaluation frequency threshold."
    : "The model has not been evaluated recently and may need re-evaluation.";

  return (
    <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1} width="100%">
      <Heading as="h3" size="md" mb={4} color={textColor}>Last Evaluation</Heading>
      <Stat>
        <StatLabel>Time since last evaluation</StatLabel>
        <StatNumber>{formatDistanceToNow(lastEvaluated)} ago</StatNumber>
        <Tooltip label={tooltipLabel} placement="top" hasArrow>
          <Flex align="center" mt={2} cursor="help">
            <Badge colorScheme={isRecentlyEvaluated ? 'green' : 'red'} mr={2}>
              {isRecentlyEvaluated ? 'Recent' : 'Needs Re-evaluation'}
            </Badge>
            {isRecentlyEvaluated ? <CheckCircleIcon color="green.500" /> : <WarningIcon color="red.500" />}
          </Flex>
        </Tooltip>
      </Stat>
    </Box>
  );
};

interface SafetyMetricsCardProps extends CardProps {
  metrics: Metric[];
}

const SafetyMetricsCard: React.FC<SafetyMetricsCardProps> = ({ metrics, cardBgColor, borderColor, textColor }) => (
  <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md" borderColor={borderColor} borderWidth={1}>
    <Heading as="h3" size="md" mb={4} color={textColor}>Evaluation Checklist</Heading>
    <List spacing={3}>
      {metrics.map((metric, index) => (
        <ListItem key={index}>
          <HStack spacing={2} align="center">
            <ListIcon
              as={metric.status === 'met' ? CheckCircleIcon : WarningIcon}
              color={metric.status === 'met' ? 'green.500' : 'red.500'}
            />
            <Text color={textColor} fontWeight="medium">{metric.display_name || metric.name}:</Text>
            <Text color={textColor}>{metric.value.toFixed(2)}</Text>
            <Tooltip label={`Threshold: ${metric.threshold}`} placement="top" hasArrow>
              <Badge colorScheme={metric.status === 'met' ? 'green' : 'red'}>
                {metric.status === 'met' ? 'Met' : 'Not Met'}
              </Badge>
            </Tooltip>
            <Tooltip label={metric.tooltip} placement="top" hasArrow>
              <InfoIcon color="blue.500" cursor="help" />
            </Tooltip>
          </HStack>
        </ListItem>
      ))}
    </List>
  </Box>
);

export default ModelSafetyTab;
