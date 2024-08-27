import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, useColorModeValue, useTheme } from '@chakra-ui/react';
import { Metric } from '../../../../types/performance-metrics';
import { rollingMean, rollingStd } from '../../utils/statistics';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TimeSeriesChartProps {
  metrics: Metric[];
  selectedMetrics: string[];
  selectedSlices: string[];
  showRollingStats: boolean;
  rollingWindow: number;
  height: number;
  lastNEvaluations: number;
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
  const [plotSize, setPlotSize] = useState({ width: 0, height });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setPlotSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [height]);

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
        const startIndex = Math.max(0, metric.history.length - lastNEvaluations);
        const filteredHistory = metric.history.slice(startIndex);
        const filteredTimestamps = metric.timestamps.slice(startIndex);
        const filteredSampleSizes = metric.sample_sizes.slice(startIndex);

        traces.push({
          x: filteredTimestamps,
          y: filteredHistory,
          type: 'scatter',
          mode: 'lines+markers',
          name: `${metricName} (${sliceName})`,
          line: { width: 2 },
          marker: { size: 6 },
          hoverinfo: 'text',
          hovertext: filteredHistory.map((value, index) =>
            `Value: ${value.toFixed(4)}<br>Sample Size: ${filteredSampleSizes[index]}<br>${new Date(filteredTimestamps[index]).toLocaleString()}`
          ),
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
              hoverinfo: 'text',
              hovertext: rollingMeanValues.map((value, index) =>
                `Rolling Mean: ${value.toFixed(4)}<br>${new Date(filteredTimestamps[index + rollingWindow - 1]).toLocaleString()}`
              ),
            },
            {
              x: filteredTimestamps.slice(rollingWindow - 1),
              y: rollingMeanValues.map((mean, i) => mean + rollingStdValues[i]),
              type: 'scatter',
              mode: 'lines',
              name: `Upper Std Dev (${metricName}, ${sliceName})`,
              line: { width: 0 },
              showlegend: false,
              hoverinfo: 'skip',
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
              hoverinfo: 'skip',
            }
          );
        }
      }
    });
  });

  return (
    <Box ref={containerRef} width="100%" height={height}>
      {plotSize.width > 0 && (
        <Plot
          data={traces}
          layout={{
            autosize: true,
            width: plotSize.width,
            height: plotSize.height,
            xaxis: {
              title: 'Timestamp',
              gridcolor: gridColor,
              zeroline: false,
              showticklabels: true,
              tickformat: '%b %d',
              tickangle: -45,
              nticks: 10,
              automargin: true,
            },
            yaxis: {
              title: 'Value',
              gridcolor: gridColor,
              zeroline: false,
              tickformat: '.2f',
            },
            legend: { orientation: 'h', y: -0.2 },
            font: { color: textColor },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { l: 50, r: 20, t: 20, b: 50 },
            hovermode: 'closest',
          }}
          config={{
            responsive: true,
            displayModeBar: false,
            scrollZoom: true,
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      )}
    </Box>
  );
};
