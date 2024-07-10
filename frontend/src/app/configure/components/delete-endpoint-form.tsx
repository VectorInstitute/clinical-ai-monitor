import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  VStack,
  FormControl,
  FormLabel,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useModelContext } from '../../context/model';

interface DeleteEndpointFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteEndpointForm: React.FC<DeleteEndpointFormProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { removeModel, models, fetchModels } = useModelContext();
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchModels();
      setSelectedEndpoint('');
      setError(null);
    }
  }, [isOpen, fetchModels]);

  const handleDelete = () => {
    if (!selectedEndpoint) {
      setError("Please select an endpoint to delete.");
      return;
    }
    setError(null);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await removeModel(selectedEndpoint);
      toast({
        title: "Evaluation endpoint deleted.",
        description: "The selected evaluation endpoint has been successfully deleted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIsAlertOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while deleting the endpoint",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Evaluation Endpoint</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!error}>
                <FormLabel htmlFor="endpoint_select">Select Endpoint to Delete</FormLabel>
                <Select
                  id="endpoint_select"
                  value={selectedEndpoint}
                  onChange={(e) => {
                    setSelectedEndpoint(e.target.value);
                    setError(null);
                  }}
                  placeholder="Select an endpoint"
                  isDisabled={isLoading}
                >
                  {models.map((model) => (
                    <option key={model.endpointName} value={model.endpointName}>
                      {model.name} ({model.endpointName})
                    </option>
                  ))}
                </Select>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3} isDisabled={isLoading}>Cancel</Button>
            <Button
              onClick={handleDelete}
              colorScheme="red"
              isDisabled={!selectedEndpoint || isLoading}
              isLoading={isLoading}
            >
              Delete Endpoint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Evaluation Endpoint
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this evaluation endpoint? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)} isDisabled={isLoading}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={isLoading}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DeleteEndpointForm;
