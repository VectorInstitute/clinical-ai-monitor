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
} from '@chakra-ui/react';
import { useModelContext } from '../../context/model';

interface DeleteServerFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteServerForm: React.FC<DeleteServerFormProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { removeModel, models, fetchModels } = useModelContext();
  const [selectedServer, setSelectedServer] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen, fetchModels]);

  const handleDelete = () => {
    if (!selectedServer) {
      toast({
        title: "Error",
        description: "Please select a server to delete.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await removeModel(selectedServer);

      toast({
        title: "Evaluation server deleted.",
        description: "The selected evaluation server has been successfully deleted.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setIsAlertOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while deleting the server",
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
          <ModalHeader>Delete Evaluation Server</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel htmlFor="server_select">Select Server to Delete</FormLabel>
                <Select
                  id="server_select"
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  placeholder="Select a server"
                  isDisabled={isLoading}
                >
                  {models.map((model) => (
                    <option key={model.serverName} value={model.serverName}>
                      {model.name} ({model.serverName})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3} isDisabled={isLoading}>Cancel</Button>
            <Button
              onClick={handleDelete}
              colorScheme="red"
              isDisabled={!selectedServer || isLoading}
              isLoading={isLoading}
            >
              Delete Server
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
              Delete Evaluation Server
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this evaluation server? This action cannot be undone.
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

export default DeleteServerForm;
