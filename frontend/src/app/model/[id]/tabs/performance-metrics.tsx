import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  Spinner,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Button,
  Stack,
  Switch,
  Tooltip,
  useBreakpointValue,
  VStack,
  Heading,
  Icon,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { z } from 'zod';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Zod schemas (unchanged)
const MetricSchema = z.object({
  name: z.string(),
  type: z.string(),
  slice: z.string(),
  tooltip: z.string(),
  value: z.number(),
  threshold: z.number(),
  passed: z.boolean(),
  history: z.array(z.number()),
  timestamps: z.array(z.string())
});

const MetricCardsSchema = z.object({
  metrics: z.array(z.string()),
  tooltips: z.array(z.string()),
  slices: z.array(z.string()),
  values: z.array(z.string()),
  collection: z.array(MetricSchema)
});

const OverviewSchema = z.object({
  last_n_evals: z.number(),
  mean_std_min_evals: z.number(),
  metric_cards: MetricCardsSchema
});

const PerformanceDataSchema = z.object({
  overview: OverviewSchema
});

type Metric = z.infer<typeof MetricSchema>;
type PerformanceData = z.infer<typeof PerformanceDataSchema>;

// Utility functions
function rollingMean(data: number[], window: number): number[] {
  const mean = [];
  for (let i = 0; i < data.length - window + 1; i++) {
    const sum = data.slice(i, i + window).reduce((a, b) => a + b, 0);
    mean.push(sum / window);
  }
  return mean;
}

function rollingStd(data: number[], window: number): number[] {
  const std = [];
  for (let i = 0; i < data.length - window + 1; i++) {
    const slice = data.slice(i, i + window);
    const mean = slice.reduce((a, b) => a + b, 0) / window;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window;
    std.push(Math.sqrt(variance));
  }
  return std;
}

function getTrend(history: number[]): 'up' | 'down' | 'neutral' {
  if (history.length < 2) return 'neutral';
  const lastTwo = history.slice(-2);
  if (lastTwo[1] > lastTwo[0]) return 'up';
  if (lastTwo[1] < lastTwo[0]) return 'down';
  return 'neutral';
}

export default function PerformanceMetricsTab() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedSlices, setSelectedSlices] = useState<string[]>(['overall']);
  const [showRollingStats, setShowRollingStats] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(3);

  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const chartHeight = useBreakpointValue({ base: 300, md: 400, lg: 500 });

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        const response = await fetch('/api/performance_metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch performance metrics');
        }
        const jsonData = await response.json();
        const validatedData = PerformanceDataSchema.parse(jsonData);
        setData(validatedData);
        setSelectedMetrics([validatedData.overview.metric_cards.metrics[0]]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformanceMetrics();
  }, []);

  const renderMetricCards = useMemo(() => {
    if (!data) return null;
    return (
      <SimpleGrid columns={cardColumns} spacing={4}>
        {data.overview.metric_cards.collection
          .filter((metric) => metric.slice === 'overall')
          .map((metric, index) => {
            const trend = getTrend(metric.history);
            return (
              <Card key={index} bg={cardBgColor} borderColor={borderColor} borderWidth={1} borderRadius="lg">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" fontSize="lg" color={textColor}>
                      {metric.name}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {metric.value.toFixed(2)}
                    </Text>
                    {trend !== 'neutral' && (
                      <Icon
                        as={trend === 'up' ? FaArrowUp : FaArrowDown}
                        color={trend === 'up' ? 'green.500' : 'red.500'}
                      />
                    )}
                    <Text fontSize="sm" color={textColor}>
                      Threshold: {metric.threshold.toFixed(2)}
                    </Text>
                    <Box width="100%" height="50px">
                      <Plot
                        data={[
                          {
                            y: metric.history,
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: trend === 'up' ? 'green' : 'red' },
                          },
                        ]}
                        layout={{
                          margin: { t: 0, r: 0, l: 0, b: 0 },
                          xaxis: { visible: false },
                          yaxis: { visible: false },
                          height: 50,
                          width: 150,
                        }}
                        config={{ displayModeBar: false }}
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
      </SimpleGrid>
    );
  }, [data, cardColumns, cardBgColor, borderColor, textColor]);

  const renderTimeSeriesPlot = useMemo(() => {
    if (!data || selectedMetrics.length === 0 || selectedSlices.length === 0) return null;

    const traces: Plotly.Data[] = [];

    selectedMetrics.forEach((metricName) => {
      selectedSlices.forEach((sliceName) => {
        const metric = data.overview.metric_cards.collection.find(
          (m) => m.name === metricName && m.slice === sliceName
        );
        if (metric) {
          traces.push({
            x: metric.timestamps,
            y: metric.history,
            type: 'scatter',
            mode: 'lines+markers',
            name: `${metricName} (${sliceName})`,
          });

          if (showRollingStats) {
            const rollingMeanValues = rollingMean(metric.history, rollingWindow);
            const rollingStdValues = rollingStd(metric.history, rollingWindow);

            traces.push(
              {
                x: metric.timestamps.slice(rollingWindow - 1),
                y: rollingMeanValues,
                type: 'scatter',
                mode: 'lines',
                name: `Rolling Mean (${metricName}, ${sliceName})`,
                line: { dash: 'dash' },
              },
              {
                x: metric.timestamps.slice(rollingWindow - 1),
                y: rollingMeanValues.map((mean, i) => mean + rollingStdValues[i]),
                type: 'scatter',
                mode: 'lines',
                name: `Upper Std Dev (${metricName}, ${sliceName})`,
                line: { width: 0 },
                showlegend: false,
              },
              {
                x: metric.timestamps.slice(rollingWindow - 1),
                y: rollingMeanValues.map((mean, i) => mean - rollingStdValues[i]),
                type: 'scatter',
                mode: 'lines',
                name: `Lower Std Dev (${metricName}, ${sliceName})`,
                line: { width: 0 },
                fillcolor: 'rgba(68, 68, 68, 0.3)',
                fill: 'tonexty',
                showlegend: false,
              }
            );
          }
        }
      });
    });

    return (
      <Plot
        data={traces}
        layout={{
          title: 'Performance Trend Over Time',
          height: chartHeight,
          xaxis: { title: 'Timestamp' },
          yaxis: { title: 'Value' },
          font: { color: textColor },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          autosize: true,
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }, [data, selectedMetrics, selectedSlices, showRollingStats, rollingWindow, chartHeight, textColor]);

  const toggleMetric = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const toggleSlice = (slice: string) => {
    setSelectedSlices((prev) =>
      prev.includes(slice) ? prev.filter((s) => s !== slice) : [...prev, slice]
    );
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading performance metrics...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Heading as="h2" size="xl" color="red.500">
          Error
        </Heading>
        <Text mt={4}>{error}</Text>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={6}>
        Performance Metrics
      </Heading>
      {renderMetricCards}
      <Heading as="h2" size="lg" mt={8} mb={4}>
        Performance Trend Over Time
      </Heading>
      <Flex direction={{ base: 'column', lg: 'row' }} gap={4}>
        <VStack align="stretch" width={{ base: '100%', lg: '300px' }} spacing={4}>
          <Card>
            <CardHeader>
              <Heading size="md">Metrics</Heading>
            </CardHeader>
            <CardBody>
              <Wrap>
                {data.overview.metric_cards.metrics.map(metric => (
                  <WrapItem key={metric}>
                    <Button
                      size="sm"
                      colorScheme={selectedMetrics.includes(metric) ? 'blue' : 'gray'}
                      onClick={() => toggleMetric(metric)}
                    >
                      {metric}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading size="md">Slices</Heading>
            </CardHeader>
            <CardBody>
              <Wrap>
                {data.overview.metric_cards.slices.map(slice => (
                  <WrapItem key={slice}>
                    <Button
                      size="sm"
                      colorScheme={selectedSlices.includes(slice) ? 'green' : 'gray'}
                      onClick={() => toggleSlice(slice)}
                    >
                      {slice}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <Heading size="md">Plot Settings</Heading>
            </CardHeader>
            <CardBody>
              <Stack>
                <Flex align="center">
                  <Switch
                    isChecked={showRollingStats}
                    onChange={(e) => setShowRollingStats(e.target.checked)}
                    mr={4}
                  />
                  <Text>Show Rolling Stats</Text>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </VStack>
        <Box flex={1} height={{ base: '400px', md: '500px', lg: '600px' }}>
          {renderTimeSeriesPlot}
        </Box>
      </Flex>
    </Box>
  );
}
