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
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface SelectModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupedModels: { [key: string]: { version: string; id: string }[] };
  onSelectModel: (modelId: string) => void;
  title: string;
}

const SelectModelModal: React.FC<SelectModelModalProps> = ({
  isOpen,
  onClose,
  groupedModels,
  onSelectModel,
  title,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {Object.entries(groupedModels).map(([modelName, versions]) => (
              <VStack key={modelName} align="stretch" spacing={2}>
                <Text fontWeight="bold" color={textColor}>{modelName}</Text>
                {versions.map(({ version, id }) => (
                  <Button
                    key={id}
                    onClick={() => {
                      onSelectModel(id);
                      onClose();
                    }}
                    variant="outline"
                  >
                    Version: {version}
                  </Button>
                ))}
              </VStack>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelectModelModal;
