import React from 'react';
import { Wrap, WrapItem, Button } from '@chakra-ui/react';

interface MetricSelectorProps {
  metrics: string[];
  selectedMetrics: string[];
  setSelectedMetrics: (metrics: string[]) => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  metrics,
  selectedMetrics,
  setSelectedMetrics,
}) => {
  const toggleMetric = (metric: string) => {
    setSelectedMetrics(
      selectedMetrics.includes(metric)
        ? selectedMetrics.filter((m) => m !== metric)
        : [...selectedMetrics, metric]
    );
  };

  return (
    <Wrap>
      {metrics.map((metric) => (
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
  );
};
