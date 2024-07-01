import React, { useState, useEffect } from 'react';
import { Box, Text, Spinner, SimpleGrid, useColorModeValue, Flex, Radio, RadioGroup, Stack, Switch, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import Plot from 'react-plotly.js';

interface Metric {
  name: string;
  type: string;
  slice: string;
  tooltip: string;
  value: number;
  threshold: number;
  passed: boolean;
  history: number[];
  timestamps: string[];
}

interface PerformanceData {
  overview: {
    last_n_evals: number;
    mean_std_min_evals: number;
    metric_cards: {
      metrics: string[];
      tooltips: string[];
      slices: string[];
      values: string[];
      collection: Metric[];
    };
  };
}

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

  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 });
  const chartHeight = useBreakpointValue({ base: 300, md: 400, lg: 500 });

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        const response = await fetch('/api/performance_metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch performance metrics');
        }
        const jsonData = await response.json();
        setData(jsonData);
        setSelectedMetric(jsonData.overview.metric_cards.metrics[0]);
        setSelectedSlice(jsonData.overview.metric_cards.slices[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceMetrics();
  }, []);

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

  const renderMetricCards = () => {
    return (
      <SimpleGrid columns={cardColumns} spacing={6}>
        {data.overview.metric_cards.collection.filter(metric => metric.slice === 'overall').map((metric, index) => (
          <Box
            key={index}
            bg={cardBgColor}
            p={6}
            borderRadius="lg"
            boxShadow="md"
            borderColor={borderColor}
            borderWidth={1}
          >
            <Text fontSize="xl" fontWeight="bold" mb={2}>
              {metric.name}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color={metric.passed ? 'green.500' : 'red.500'}>
              {metric.value.toFixed(2)}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Threshold: {metric.threshold.toFixed(2)}
            </Text>
            <Text fontSize="sm" mt={2}>
              {metric.tooltip}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  const renderTimeSeriesPlot = () => {
    const metric = data.overview.metric_cards.collection.find(m => m.name === selectedMetric && m.slice === selectedSlice);

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
      },
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
        },
        {
          x: metric.timestamps.slice(rollingWindow - 1),
          y: rollingMeanValues.map((mean, i) => mean + rollingStdValues[i]),
          type: 'scatter',
          mode: 'lines',
          name: 'Upper Std Dev',
          line: { width: 0 },
          showlegend: false,
        },
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
        }
      );
    }

    return (
      <Plot
        data={traces}
        layout={{
          title: `${metric.name} Over Time (${selectedSlice})`,
          xaxis: { title: 'Date' },
          yaxis: { title: 'Value' },
          autosize: true,
          height: chartHeight,
          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
          legend: { orientation: 'h', y: -0.2 },
          plot_bgcolor: useColorModeValue('#f8f9fa', '#2D3748'),
          paper_bgcolor: useColorModeValue('#ffffff', '#1A202C'),
          font: { color: textColor },
        }}
        config={{ responsive: true }}
        style={{ width: '100%' }}
      />
    );
  };

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Performance Metrics
      </Text>
      {renderMetricCards()}
      <Box mt={10}>
        <Flex justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap">
          <Text fontSize="xl" fontWeight="bold">Performance Trend Over Time</Text>
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
        {renderTimeSeriesPlot()}
      </Box>
    </Box>
  );
}
