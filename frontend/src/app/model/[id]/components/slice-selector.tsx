import React from 'react';
import { Wrap, WrapItem, Button } from '@chakra-ui/react';

interface SliceSelectorProps {
  slices: string[];
  selectedSlices: string[];
  setSelectedSlices: (slices: string[]) => void;
}

export const SliceSelector: React.FC<SliceSelectorProps> = ({
  slices,
  selectedSlices,
  setSelectedSlices,
}) => {
  const toggleSlice = (slice: string) => {
    setSelectedSlices(
      selectedSlices.includes(slice)
        ? selectedSlices.filter((s) => s !== slice)
        : [...selectedSlices, slice]
    );
  };

  return (
    <Wrap>
      {slices.map((slice) => (
        <WrapItem key={slice}>
          <Button
            size="sm"
            colorScheme={selectedSlices.includes(slice) ? 'blue' : 'gray'}
            onClick={() => toggleSlice(slice)}
          >
            {slice}
          </Button>
        </WrapItem>
      ))}
    </Wrap>
  );
};
