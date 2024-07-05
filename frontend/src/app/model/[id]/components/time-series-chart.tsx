import React from 'react';
import dynamic from 'next/dynamic';
import { Box, useColorModeValue, useTheme } from '@chakra-ui/react';
import { Metric } from '../types/performance-metrics';
import { rollingMean, rollingStd } from '../utils/statistics';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TimeSeriesChartProps {
  metrics: Metric[];
  selectedMetrics: string[];
  selectedSlices: string[];
  showRollingStats: boolean;
  rollingWindow: number;
  height: number;
  lastNEvaluations: number | null;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  metrics,
  selectedMetrics,
  selectedSlices,
  showRollingStats,
  rollingWindow,
  height,
  lastNEvaluations,
}) => {
  const theme = useTheme();
  const textColor = useColorModeValue('gray.800', 'white');
  const gridColor = useColorModeValue('gray.200', 'gray.700');

  const traces: Plotly.Data[] = [];

  selectedMetrics.forEach((metricName) => {
    selectedSlices.forEach((sliceName) => {
      const metric = metrics.find(
        (m) => m.name === metricName && m.slice === sliceName
      );

      if (metric) {
        const startIndex = lastNEvaluations ? Math.max(0, metric.history.length - lastNEvaluations) : 0;
        const filteredHistory = metric.history.slice(startIndex);
        const filteredTimestamps = metric.timestamps.slice(startIndex);

        traces.push({
          x: filteredTimestamps,
          y: filteredHistory,
          type: 'scatter',
          mode: 'lines+markers',
          name: `${metricName} (${sliceName})`,
          line: { width: 2 },
          marker: { size: 6 },
        });

        if (showRollingStats) {
          const rollingMeanValues = rollingMean(filteredHistory, rollingWindow);
          const rollingStdValues = rollingStd(filteredHistory, rollingWindow);

          traces.push(
            {
              x: filteredTimestamps.slice(rollingWindow - 1),
              y: rollingMeanValues,
              type: 'scatter',
              mode: 'lines',
              name: `Rolling Mean (${metricName}, ${sliceName})`,
              line: { dash: 'dash', width: 2 },
            },
            {
              x: filteredTimestamps.slice(rollingWindow - 1),
              y: rollingMeanValues.map((mean, i) => mean + rollingStdValues[i]),
              type: 'scatter',
              mode: 'lines',
              name: `Upper Std Dev (${metricName}, ${sliceName})`,
              line: { width: 0 },
              showlegend: false,
            },
            {
              x: filteredTimestamps.slice(rollingWindow - 1),
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
    <Box width="100%" height={height}>
      <Plot
        data={traces}
        layout={{
          autosize: true,
          xaxis: {
            title: 'Timestamp',
            gridcolor: gridColor,
            zeroline: false,
          },
          yaxis: {
            title: 'Value',
            gridcolor: gridColor,
            zeroline: false,
          },
          legend: { orientation: 'h', y: -0.2 },
          font: { color: textColor },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          margin: { l: 50, r: 20, t: 20, b: 50 },
        }}
        config={{ responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
};
