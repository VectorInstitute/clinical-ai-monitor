import React from 'react';
import { Stack, Switch, Text, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box } from '@chakra-ui/react';

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
    <Stack spacing={4}>
      <Stack direction="row" align="center" spacing={4}>
        <Switch
          isChecked={showRollingStats}
          onChange={(e) => setShowRollingStats(e.target.checked)}
        />
        <Text>Show Rolling Stats</Text>
      </Stack>
      {showRollingStats && (
        <Stack direction="row" align="center" spacing={4}>
          <Text>Window Size:</Text>
          <NumberInput
            value={rollingWindow}
            onChange={(_, value) => setRollingWindow(value)}
            min={2}
            max={10}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Stack>
      )}
      <Box>
        <Text mb={2}>Last N Evaluations: {lastNEvaluations}</Text>
        <Slider
          min={1}
          max={maxEvaluations}
          step={1}
          value={lastNEvaluations}
          onChange={handleLastNEvaluationsChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
    </Stack>
  );
};
