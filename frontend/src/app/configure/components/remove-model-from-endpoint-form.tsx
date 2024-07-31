import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  useToast,
  Select,
  FormControl,
  FormLabel,
  VStack,
} from '@chakra-ui/react';
import { useEndpointContext } from '../../context/endpoint';
import { useModelContext } from '../../context/model';

interface RemoveModelFromEndpointFormProps {
  isOpen: boolean;
  onClose: () => void;
  endpointName: string;
  models: string[];
}

const RemoveModelFromEndpointForm: React.FC<RemoveModelFromEndpointFormProps> = ({
  isOpen,
  onClose,
  endpointName,
  models,
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const toast = useToast();
  const { removeModelFromEndpoint } = useEndpointContext();
  const { getModelById } = useModelContext();

  const handleModelSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  }, []);

  const handleRemove = useCallback(async () => {
    if (!selectedModel) {
      toast({
        title: "No model selected",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await removeModelFromEndpoint(endpointName, selectedModel);
      toast({
        title: "Model removed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Failed to remove model",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedModel, removeModelFromEndpoint, endpointName, toast, onClose]);

  const modelOptions = useMemo(() => {
    return models.map((modelId) => ({
      value: modelId,
      label: modelId,
    }));
  }, [models]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Remove Model from Endpoint</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel htmlFor="model-select">Select Model to Remove</FormLabel>
              <Select
                id="model-select"
                value={selectedModel}
                onChange={handleModelSelect}
                placeholder="Select a model"
              >
                {modelOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormControl>
            {selectedModel && (
              <Text>
                Are you sure you want to remove the selected model from this endpoint?
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleRemove} isDisabled={!selectedModel}>
            Remove
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RemoveModelFromEndpointForm;
