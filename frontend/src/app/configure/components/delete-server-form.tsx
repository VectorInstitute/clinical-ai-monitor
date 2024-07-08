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

interface ServerOption {
  name: string;
  serverName: string;
}

const DeleteServerForm: React.FC<DeleteServerFormProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { removeModel } = useModelContext();
  const [selectedServer, setSelectedServer] = useState('');
  const [serverOptions, setServerOptions] = useState<ServerOption[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    if (isOpen) {
      fetchEvaluationServers();
    }
  }, [isOpen]);

  const fetchEvaluationServers = async () => {
    try {
      const response = await fetch('/api/evaluation_servers');
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation servers');
      }
      const data = await response.json();
      setServerOptions(data.servers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch evaluation servers",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
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
    try {
      const response = await fetch(`/api/delete_evaluation_server/${selectedServer}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete evaluation server');
      }

      removeModel(selectedServer);

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
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
                >
                  {serverOptions.map((server) => (
                    <option key={server.serverName} value={server.serverName}>
                      {server.name} ({server.serverName})
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Cancel</Button>
            <Button onClick={handleDelete} colorScheme="red" isDisabled={!selectedServer}>
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
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
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
