import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useEndpointContext } from '../../context/endpoint';
import { useModelContext } from '../../context/model';

interface AddModelToEndpointFormProps {
  isOpen: boolean;
  onClose: () => void;
  endpointName: string;
}

const AddModelToEndpointForm: React.FC<AddModelToEndpointFormProps> = ({ isOpen, onClose, endpointName }) => {
  const [modelName, setModelName] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [selectedExistingModel, setSelectedExistingModel] = useState('');
  const [isExistingModel, setIsExistingModel] = useState(false);

  const { addModelToEndpoint } = useEndpointContext();
  const { models } = useModelContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isExistingModel) {
        const [name, version] = selectedExistingModel.split('|');
        await addModelToEndpoint(endpointName, name, version, true);
      } else {
        await addModelToEndpoint(endpointName, modelName, modelVersion, false);
      }
      onClose();
    } catch (error) {
      console.error('Error adding model to endpoint:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Model to Endpoint</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Add existing model or create new?</FormLabel>
                <Select value={isExistingModel ? 'existing' : 'new'} onChange={(e) => setIsExistingModel(e.target.value === 'existing')}>
                  <option value="new">Create New Model</option>
                  <option value="existing">Add Existing Model</option>
                </Select>
              </FormControl>
              {isExistingModel ? (
                <FormControl>
                  <FormLabel>Select Existing Model</FormLabel>
                  <Select value={selectedExistingModel} onChange={(e) => setSelectedExistingModel(e.target.value)}>
                    <option value="">Select a model</option>
                    {models.map((model) => (
                      <option key={model.id} value={`${model.basic_info.name}|${model.basic_info.version}`}>
                        {model.basic_info.name} (v{model.basic_info.version})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  <FormControl>
                    <FormLabel>Model Name</FormLabel>
                    <Input value={modelName} onChange={(e) => setModelName(e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Model Version</FormLabel>
                    <Input value={modelVersion} onChange={(e) => setModelVersion(e.target.value)} />
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" colorScheme="blue" mr={3}>
              Add Model
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddModelToEndpointForm;
