import React from 'react';
import { SimpleGrid, useBreakpointValue } from '@chakra-ui/react';
import { MetricCard } from './metric-card';
import { Metric } from '../types/performance-metrics';

interface MetricCardsProps {
  metrics: Metric[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const cardColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  return (
    <SimpleGrid columns={cardColumns} spacing={{ base: 2, sm: 3, md: 4 }}>
      {metrics
        .filter((metric) => metric.slice === 'overall')
        .map((metric) => (
          <MetricCard key={metric.name} metric={metric} />
        ))}
    </SimpleGrid>
  );
};
