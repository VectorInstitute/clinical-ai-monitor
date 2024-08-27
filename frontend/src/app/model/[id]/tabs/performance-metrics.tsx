import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Text,
  Flex,
  VStack,
  Heading,
  useBreakpointValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { MetricCards } from './components/metric-cards';
import { MetricSelector } from './components/metric-selector';
import { SliceSelector } from './components/slice-selector';
import { PlotSettings } from './components/plot-settings';
import { TimeSeriesChart } from './components/time-series-chart';
import { PerformanceData, PerformanceDataSchema, Metric } from '../../../types/performance-metrics';

interface PerformanceMetricsTabProps {
  endpointName: string;
  modelId: string;
}

const MAX_CARD_DATA_POINTS = 16;

export default function PerformanceMetricsTab({ endpointName, modelId }: PerformanceMetricsTabProps) {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedSlices, setSelectedSlices] = useState<string[]>(['overall']);
  const [showRollingStats, setShowRollingStats] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(3);
  const [lastNEvaluations, setLastNEvaluations] = useState<number>(20);

  const chartHeight = useBreakpointValue({ base: 300, md: 400, lg: 500 }) ?? 300;

  const fetchPerformanceMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/performance_metrics/${endpointName}/${modelId}`);
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
  }, [endpointName, modelId]);

  useEffect(() => {
    fetchPerformanceMetrics();
  }, [fetchPerformanceMetrics]);

  const limitDataPoints = useCallback((metric: Metric, limit: number): Metric => ({
    ...metric,
    history: metric.history.slice(-limit),
    timestamps: metric.timestamps.slice(-limit),
    sample_sizes: metric.sample_sizes.slice(-limit),
  }), []);

  const limitedMetrics = useMemo(() => {
    if (!data || !data.overview.has_data) return [];
    return data.overview.metric_cards.collection.map(metric =>
      limitDataPoints(metric, MAX_CARD_DATA_POINTS)
    );
  }, [data, limitDataPoints]);

  const handleMetricSelect = useCallback((metrics: string[]) => {
    setSelectedMetrics(metrics);
  }, []);

  const handleSliceSelect = useCallback((slices: string[]) => {
    setSelectedSlices(slices);
  }, []);

  const handleRollingStatsToggle = useCallback((show: boolean) => {
    setShowRollingStats(show);
  }, []);

  const handleRollingWindowChange = useCallback((window: number) => {
    setRollingWindow(window);
  }, []);

  const handleLastNEvaluationsChange = useCallback((n: number) => {
    setLastNEvaluations(n);
  }, []);

  const renderContent = () => {
    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!data || !data.overview.has_data) {
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
      <>
        <MetricCards metrics={limitedMetrics} />

        <Divider my={8} />

        <Box width="100%">
          <Heading as="h3" size="lg" mb={1}>
            How is your model doing over time?
          </Heading>
          <Text fontSize="md" color="gray.600" mb={4}>
            See how your model is performing over several metrics and subgroups over time.
          </Text>
          <Flex direction={{ base: 'column', md: 'row' }} align="flex-start" gap={8}>
            <Box width={{ base: '100%', md: '25%' }} mr={{ base: 0, md: 8 }} mb={{ base: 8, md: 0 }}>
              <VStack spacing={8} align="stretch">
                <Box>
                  <Heading as="h4" size="md" mb={3}>
                    Metrics
                  </Heading>
                  <MetricSelector
                    metrics={data.overview.metric_cards.metrics}
                    selectedMetrics={selectedMetrics}
                    setSelectedMetrics={handleMetricSelect}
                  />
                </Box>
                <Box>
                  <Heading as="h4" size="md" mb={3}>
                    Subgroups
                  </Heading>
                  <SliceSelector
                    slices={data.overview.metric_cards.slices}
                    selectedSlices={selectedSlices}
                    setSelectedSlices={handleSliceSelect}
                  />
                </Box>
                <Box>
                  <Heading as="h4" size="md" mb={3}>
                    Settings
                  </Heading>
                  <PlotSettings
                    showRollingStats={showRollingStats}
                    setShowRollingStats={handleRollingStatsToggle}
                    rollingWindow={rollingWindow}
                    setRollingWindow={handleRollingWindowChange}
                    lastNEvaluations={lastNEvaluations}
                    setLastNEvaluations={handleLastNEvaluationsChange}
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
      </>
    );
  };

  return (
    <VStack spacing={8} align="stretch" width="100%">
      <Box>
        <Skeleton isLoaded={!isLoading}>
          <Heading as="h2" size="lg" mb={1}>
            How is your model doing?
          </Heading>
        </Skeleton>
        <SkeletonText isLoaded={!isLoading} noOfLines={1} spacing="4">
          <Text fontSize="md" color="gray.600">
            A quick glance of your most important metrics.
          </Text>
        </SkeletonText>
      </Box>

      {isLoading ? (
        <VStack spacing={4} align="stretch">
          <Skeleton height="200px" />
          <Skeleton height="400px" />
        </VStack>
      ) : (
        renderContent()
      )}
    </VStack>
  );
}
