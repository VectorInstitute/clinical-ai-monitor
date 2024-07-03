import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  Spinner,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Tooltip,
  useBreakpointValue,
  VStack,
  Heading,
  Icon,
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedSlice, setSelectedSlice] = useState<string>('overall');
  const [showRollingStats, setShowRollingStats] = useState<boolean>(false);
  const [rollingWindow, setRollingWindow] = useState<number>(3);

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
        setSelectedMetric(validatedData.overview.metric_cards.metrics[0]);
        setSelectedSlice(validatedData.overview.metric_cards.slices[0]);
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
      <SimpleGrid columns={cardColumns} spacing={6}>
        {data.overview.metric_cards.collection
          .filter((metric) => metric.slice === 'overall')
          .map((metric, index) => {
            const trend = getTrend(metric.history);
            return (
              <Tooltip key={index} label={metric.tooltip} placement="top">
                <Box
                  bg={cardBgColor}
                  p={6}
                  borderRadius="lg"
                  boxShadow="md"
                  borderColor={borderColor}
                  borderWidth={1}
                >
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{metric.name}</Heading>
                    <Flex alignItems="center">
                      <Text fontSize="3xl" fontWeight="bold" color={metric.passed ? 'green.500' : 'red.500'}>
                        {metric.value.toFixed(2)}
                      </Text>
                      {trend !== 'neutral' && (
                        <Icon
                          as={trend === 'up' ? FaArrowUp : FaArrowDown}
                          color={trend === 'up' ? 'green.500' : 'red.500'}
                          ml={2}
                        />
                      )}
                    </Flex>
                    <Text fontSize="sm" color="gray.500">
                      Threshold: {metric.threshold.toFixed(2)}
                    </Text>
                    <Box w="100%" h="100px">
                      <Plot
                        data={[
                          {
                            y: metric.history,
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: metric.passed ? 'green' : 'red' },
                          },
                        ]}
                        layout={{
                          autosize: true,
                          height: 100,
                          margin: { l: 30, r: 10, t: 10, b: 30 },
                          xaxis: {
                            showticklabels: false,
                            showgrid: false,
                            zeroline: false,
                          },
                          yaxis: {
                            showticklabels: true,
                            showgrid: true,
                            zeroline: false,
                          },
                          showlegend: false,
                        }}
                        config={{ displayModeBar: false }}
                        style={{ width: '100%' }}
                      />
                    </Box>
                  </VStack>
                </Box>
              </Tooltip>
            );
          })}
      </SimpleGrid>
    );
  }, [data, cardColumns, cardBgColor, borderColor, textColor]);

  const renderTimeSeriesPlot = useMemo(() => {
    if (!data || !selectedMetric || !selectedSlice) return null;
    const metric = data.overview.metric_cards.collection.find(
      (m) => m.name === selectedMetric && m.slice === selectedSlice
    );
    if (!metric) return null;

    const rollingMeanValues = rollingMean(metric.history, rollingWindow);
    const rollingStdValues = rollingStd(metric.history, rollingWindow);

    const traces = [
      {
        x: metric.timestamps,
        y: metric.history,
        type: 'scatter',
        mode: 'lines+markers',
        name: metric.name,
        line: { color: 'blue' },
      } as Plotly.Data,
    ];

    if (showRollingStats) {
      traces.push(
        {
          x: metric.timestamps.slice(rollingWindow - 1),
          y: rollingMeanValues,
          type: 'scatter',
          mode: 'lines',
          name: 'Rolling Mean',
          line: { color: 'red', dash: 'dash' },
        } as Plotly.Data,
        {
          x: metric.timestamps.slice(rollingWindow - 1),
          y: rollingMeanValues.map((mean, i) => mean + rollingStdValues[i]),
          type: 'scatter',
          mode: 'lines',
          name: 'Upper Std Dev',
          line: { width: 0 },
          showlegend: false,
        } as Plotly.Data,
        {
          x: metric.timestamps.slice(rollingWindow - 1),
          y: rollingMeanValues.map((mean, i) => mean - rollingStdValues[i]),
          type: 'scatter',
          mode: 'lines',
          name: 'Lower Std Dev',
          line: { width: 0 },
          fillcolor: 'rgba(68, 68, 68, 0.3)',
          fill: 'tonexty',
          showlegend: false,
        } as Plotly.Data
      );
    }

    return (
      <Plot
        data={traces}
        layout={{
          title: `${selectedMetric} Over Time (${selectedSlice})`,
          xaxis: { title: 'Date' },
          yaxis: { title: 'Value' },
          height: chartHeight,
          autosize: true,
          margin: { l: 50, r: 50, t: 50, b: 50 },
          legend: { orientation: 'h', y: -0.2 },
          plot_bgcolor: useColorModeValue('#f8f9fa', '#2D3748'),
          paper_bgcolor: useColorModeValue('#ffffff', '#1A202C'),
          font: { color: textColor },
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />
    );
  }, [data, selectedMetric, selectedSlice, showRollingStats, rollingWindow, chartHeight, textColor]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading performance metrics...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Box>
      <Heading as="h2" size="xl" mb={6}>
        Performance Metrics
      </Heading>
      {renderMetricCards}
      <Box mt={10}>
        <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
          <Heading as="h3" size="lg">Performance Trend Over Time</Heading>
          <Flex alignItems="center" flexWrap="wrap">
            <Tooltip label="Toggle rolling mean and standard deviation">
              <Switch
                isChecked={showRollingStats}
                onChange={(e) => setShowRollingStats(e.target.checked)}
                mr={4}
              />
            </Tooltip>
            <RadioGroup onChange={setSelectedMetric} value={selectedMetric} mr={4}>
              <Stack direction="row" flexWrap="wrap">
                {data.overview.metric_cards.metrics.map(metric => (
                  <Radio key={metric} value={metric}>{metric}</Radio>
                ))}
              </Stack>
            </RadioGroup>
            <RadioGroup onChange={setSelectedSlice} value={selectedSlice}>
              <Stack direction="row" flexWrap="wrap">
                {data.overview.metric_cards.slices.map(slice => (
                  <Radio key={slice} value={slice}>{slice}</Radio>
                ))}
              </Stack>
            </RadioGroup>
          </Flex>
        </Flex>
        {renderTimeSeriesPlot}
      </Box>
    </Box>
  );
}
