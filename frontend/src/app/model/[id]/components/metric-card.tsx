import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, Icon, useColorModeValue, Flex, Tooltip, VStack } from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Metric } from '../types/performance-metrics';
import { getTrend } from '../utils/trend';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const [plotSize, setPlotSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setPlotSize({ width, height: height * 0.6 });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const cardBgColor = useColorModeValue('white', 'gray.50');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const lineColor = useColorModeValue('#3182CE', '#63B3ED');
  const gridColor = useColorModeValue('gray.100', 'gray.700');
  const trend = getTrend(metric.history);

  const trendPlotData = [
    {
      x: metric.timestamps,
      y: metric.history,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: lineColor, width: 2 },
      marker: { size: 4, color: lineColor },
      hoverinfo: 'x+y+text',
      hovertext: metric.history.map((value, index) =>
        `Value: ${value.toFixed(2)}<br>Sample Size: ${metric.sample_sizes[index]}`
      ),
    },
  ];

  const trendPlotLayout = {
    autosize: true,
    margin: { l: 30, r: 10, t: 10, b: 30 },
    xaxis: {
      showticklabels: true,
      showgrid: true,
      gridcolor: gridColor,
      tickformat: '%b %d',
      tickangle: -45,
      nticks: 4,
      automargin: true,
    },
    yaxis: {
      range: [Math.min(...metric.history) * 0.95, Math.max(...metric.history) * 1.05],
      showticklabels: true,
      showgrid: true,
      gridcolor: gridColor,
      tickformat: '.2f',
      nticks: 4,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    hovermode: 'closest',
  };

  const metricColor = metric.value >= metric.threshold ? 'green.500' : 'red.500';

  return (
    <Box
      ref={containerRef}
      bg={cardBgColor}
      borderWidth="1px"
      borderRadius="xl"
      borderColor={borderColor}
      p={{ base: 2, sm: 3, md: 4 }}
      color={textColor}
      boxShadow="md"
      transition="all 0.3s"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
      width="100%"
      height="100%"
    >
      <VStack align="stretch" spacing={2} height="100%">
        <Tooltip label={metric.tooltip} placement="top">
          <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} mb={1}>
            {metric.name}
          </Text>
        </Tooltip>
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color={metricColor}>
            {metric.value.toFixed(2)}
          </Text>
          {trend !== 'neutral' && (
            <Icon
              as={trend === 'up' ? FaArrowUp : FaArrowDown}
              color={trend === 'up' ? 'green.500' : 'red.500'}
              boxSize={{ base: 5, md: 6 }}
            />
          )}
        </Flex>
        <Box width="100%" flexGrow={1}>
          {plotSize.width > 0 && (
            <Plot
              data={trendPlotData}
              layout={{
                ...trendPlotLayout,
                width: plotSize.width,
                height: plotSize.height,
              }}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler={true}
            />
          )}
        </Box>
        <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="medium" color={textColor}>
          Threshold: {metric.threshold.toFixed(2)}
        </Text>
      </VStack>
    </Box>
  );
};
