import React from 'react';
import {
  Stack,
  Switch,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Tooltip,
  Flex,
} from '@chakra-ui/react';

interface PlotSettingsProps {
  showRollingStats: boolean;
  setShowRollingStats: (show: boolean) => void;
  rollingWindow: number;
  setRollingWindow: (window: number) => void;
  lastNEvaluations: number;
  setLastNEvaluations: (n: number) => void;
  maxEvaluations: number;
}

export const PlotSettings: React.FC<PlotSettingsProps> = ({
  showRollingStats,
  setShowRollingStats,
  rollingWindow,
  setRollingWindow,
  lastNEvaluations,
  setLastNEvaluations,
  maxEvaluations,
}) => {
  const handleLastNEvaluationsChange = (value: number) => {
    setLastNEvaluations(Math.max(1, Math.min(maxEvaluations, value)));
  };

  return (
    <Stack spacing={6}>
      <Flex align="center" justify="space-between">
        <Text fontWeight="medium">Show Rolling Stats</Text>
        <Switch
          isChecked={showRollingStats}
          onChange={(e) => setShowRollingStats(e.target.checked)}
          colorScheme="blue"
          size="lg"
        />
      </Flex>
      {showRollingStats && (
        <Box>
          <Text mb={2} fontWeight="medium">Window Size: {rollingWindow}</Text>
          <Slider
            min={2}
            max={10}
            step={1}
            value={rollingWindow}
            onChange={(value) => setRollingWindow(value)}
            colorScheme="blue"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Box>
      )}
      <Box>
        <Text mb={2} fontWeight="medium">Last N Evaluations: {lastNEvaluations}</Text>
        <Slider
          min={1}
          max={maxEvaluations}
          step={1}
          value={lastNEvaluations}
          onChange={handleLastNEvaluationsChange}
          colorScheme="blue"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <Tooltip label={lastNEvaluations} placement="top" hasArrow>
            <SliderThumb boxSize={6} />
          </Tooltip>
        </Slider>
      </Box>
    </Stack>
  );
};
