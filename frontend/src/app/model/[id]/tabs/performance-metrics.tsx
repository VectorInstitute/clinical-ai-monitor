import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  SimpleGrid,
  Flex,
  VStack,
  Heading,
  useBreakpointValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { ErrorMessage } from '../components/error-message';
import { LoadingSpinner } from '../components/loading-spinner';
import { MetricCard } from '../components/metric-card';
import { MetricSelector } from '../components/metric-selector';
import { SliceSelector } from '../components/slice-selector';
import { PlotSettings } from '../components/plot-settings';
import { TimeSeriesChart } from '../components/time-series-chart';
import { PerformanceData, PerformanceDataSchema } from '../types/performance-metrics';

interface PerformanceMetricsTabProps {
  endpointName: string;
}

export default function PerformanceMetricsTab({ endpointName }: PerformanceMetricsTabProps) {
  console.log(`PerformanceMetricsTab: endpointName = ${endpointName}`);
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedSlices, setSelectedSlices] = useState<string[]>(['overall']);
  const [showRollingStats, setShowRollingStats] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(3);
  const [lastNEvaluations, setLastNEvaluations] = useState<number>(20);

  const cardColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const chartHeight = useBreakpointValue({ base: 300, md: 400, lg: 500 });

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/performance_metrics/${endpointName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch performance metrics');
        }
        const fetchedData = await response.json();
        const validatedData = PerformanceDataSchema.parse(fetchedData);
        setData(validatedData);
        if (validatedData.overview.has_data) {
          setSelectedMetrics([validatedData.overview.metric_cards.metrics[0]]);
          setLastNEvaluations(Math.min(20, validatedData.overview.last_n_evals));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformanceMetrics();
  }, [endpointName]);

  const renderMetricCards = useMemo(() => {
    if (!data || !data.overview.has_data) return null;
    return (
      <SimpleGrid columns={cardColumns} spacing={4} width="100%">
        {data.overview.metric_cards.collection
          .filter((metric) => metric.slice === 'overall')
          .map((metric) => (
            <MetricCard key={metric.name} metric={metric} />
          ))}
      </SimpleGrid>
    );
  }, [data, cardColumns]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  if (!data.overview.has_data) {
    return (
      <Alert
        status="info"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          No Evaluation Data Available
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          It looks like there's no evaluation data for this endpoint yet. Start logging evaluation data to see performance metrics here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack spacing={8} align="stretch" width="100%">
      <Box>
        <Heading as="h2" size="lg" mb={1}>
          How is your model doing?
        </Heading>
        <Text fontSize="md" color="gray.600">
          A quick glance of your most important metrics.
        </Text>
      </Box>

      {renderMetricCards}

      <Divider my={8} />

      <Box width="100%">
        <Heading as="h3" size="lg" mb={1}>
          How is your model doing over time?
        </Heading>
        <Text fontSize="md" color="gray.600" mb={4}>
          See how your model is performing over several metrics and subgroups over time.
        </Text>
        <Flex direction={{ base: 'column', md: 'row' }} align="flex-start" spacing={8}>
          <Box width={{ base: '100%', md: '25%' }} mr={{ base: 0, md: 8 }} mb={{ base: 8, md: 0 }}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading as="h4" size="md" mb={2}>
                  Metrics
                </Heading>
                <MetricSelector
                  metrics={data.overview.metric_cards.metrics}
                  selectedMetrics={selectedMetrics}
                  setSelectedMetrics={setSelectedMetrics}
                />
              </Box>
              <Box>
                <Heading as="h4" size="md" mb={2}>
                  Subgroups
                </Heading>
                <SliceSelector
                  slices={data.overview.metric_cards.slices}
                  selectedSlices={selectedSlices}
                  setSelectedSlices={setSelectedSlices}
                />
              </Box>
              <Box>
                <Heading as="h4" size="md" mb={2}>
                  Settings
                </Heading>
                <PlotSettings
                  showRollingStats={showRollingStats}
                  setShowRollingStats={setShowRollingStats}
                  rollingWindow={rollingWindow}
                  setRollingWindow={setRollingWindow}
                  lastNEvaluations={lastNEvaluations}
                  setLastNEvaluations={setLastNEvaluations}
                  maxEvaluations={data.overview.last_n_evals}
                />
              </Box>
            </VStack>
          </Box>
          <Box width={{ base: '100%', md: '75%' }} height={chartHeight}>
            <TimeSeriesChart
              metrics={data.overview.metric_cards.collection}
              selectedMetrics={selectedMetrics}
              selectedSlices={selectedSlices}
              showRollingStats={showRollingStats}
              rollingWindow={rollingWindow}
              height={chartHeight}
              lastNEvaluations={lastNEvaluations}
            />
          </Box>
        </Flex>
      </Box>
    </VStack>
  );
}
