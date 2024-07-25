import React from 'react';
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
} from '@chakra-ui/react';
import { useEndpointContext } from '../../context/endpoint';

interface RemoveModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  endpointName: string;
  modelName: string;
}

const RemoveModelForm: React.FC<RemoveModelFormProps> = ({ isOpen, onClose, endpointName, modelName }) => {
  const toast = useToast();
  const { removeModelFromEndpoint } = useEndpointContext();

  const handleRemove = async () => {
    try {
      await removeModelFromEndpoint(endpointName, modelName);
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Remove Model from Endpoint</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Are you sure you want to remove the model "{modelName}" from this endpoint?</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleRemove}>
            Remove
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RemoveModelForm;
