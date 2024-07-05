import React from 'react';
import { Box, Text, Icon, useColorModeValue, Flex, Tooltip } from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Metric } from '../types/performance-metrics';
import { getTrend } from '../utils/trend';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface MetricCardProps {
  metric: Metric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const lineColor = useColorModeValue('#3182CE', '#63B3ED');
  const gridColor = useColorModeValue('lightgray', 'gray.600');
  const trend = getTrend(metric.history);

  const trendPlotData = [
    {
      x: metric.timestamps,
      y: metric.history,
      type: 'scatter',
      mode: 'lines',
      line: { color: lineColor, width: 2 },
    },
  ];

  const trendPlotLayout = {
    width: 160,
    height: 60,
    margin: { l: 0, r: 0, t: 0, b: 0 },
    xaxis: {
      showticklabels: false,
      showgrid: false,
      zeroline: false,
    },
    yaxis: {
      showticklabels: false,
      showgrid: true,
      gridcolor: gridColor,
      gridwidth: 1,
      zeroline: false,
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
  };

  const metricColor = metric.value >= metric.threshold ? 'green.500' : 'red.500';

  return (
    <Box
      bg={cardBgColor}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      p={3}
      color={textColor}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: 'md' }}
    >
      <Tooltip label={metric.tooltip} placement="top">
        <Text fontWeight="bold" fontSize="md" mb={1}>
          {metric.name}
        </Text>
      </Tooltip>
      <Flex justifyContent="space-between" alignItems="center" mb={1}>
        <Text fontSize="2xl" fontWeight="semibold" color={metricColor}>
          {metric.value.toFixed(2)}
        </Text>
        {trend !== 'neutral' && (
          <Icon
            as={trend === 'up' ? FaArrowUp : FaArrowDown}
            color={trend === 'up' ? 'green.500' : 'red.500'}
            boxSize={6}
            ml={2}
          />
        )}
      </Flex>
      <Box>
        <Plot
          data={trendPlotData}
          layout={trendPlotLayout}
          config={{ displayModeBar: false, responsive: true }}
        />
      </Box>
      <Text fontSize="sm" color={textColor} mt={1}>
        Threshold: {metric.threshold.toFixed(2)}
      </Text>
    </Box>
  );
};
