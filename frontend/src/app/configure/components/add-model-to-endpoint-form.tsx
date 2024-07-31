import React, { useState, useEffect, useCallback } from 'react';
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
  useToast,
} from '@chakra-ui/react';
import { useEndpointContext } from '../../context/endpoint';
import { useModelContext } from '../../context/model';

interface AddModelToEndpointFormProps {
  isOpen: boolean;
  onClose: () => void;
  endpointName: string;
}

const AddModelToEndpointForm: React.FC<AddModelToEndpointFormProps> = ({ isOpen, onClose, endpointName }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    modelVersion: '',
    selectedExistingModel: '',
    isExistingModel: false,
  });
  const [existingModels, setExistingModels] = useState<string[]>([]);

  const toast = useToast();
  const { addModelToEndpoint, endpoints } = useEndpointContext();
  const { models } = useModelContext();

  useEffect(() => {
    const endpoint = endpoints.find(e => e.name === endpointName);
    if (endpoint) {
      setExistingModels(endpoint.models);
    }
  }, [endpointName, endpoints]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleModelTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const isExisting = e.target.value === 'existing';
    setFormData(prev => ({ ...prev, isExistingModel: isExisting }));
  }, []);

  const isDuplicateModel = useCallback((name: string, version: string) => {
    return existingModels.some(modelId => {
      const model = models.find(m => m.id === modelId);
      return model && model.basic_info.name === name && model.basic_info.version === version;
    });
  }, [existingModels, models]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isExistingModel, selectedExistingModel, modelName, modelVersion } = formData;

    try {
      let name: string, version: string;
      if (isExistingModel) {
        [name, version] = selectedExistingModel.split('|');
      } else {
        name = modelName;
        version = modelVersion;
      }

      if (isDuplicateModel(name, version)) {
        toast({
          title: "Duplicate model",
          description: "A model with the same name and version already exists in this endpoint.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await addModelToEndpoint(endpointName, name, version, isExistingModel);
      toast({
        title: "Model added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error('Error adding model to endpoint:', error);
      toast({
        title: "Error adding model",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
        <ModalHeader>Add Model to Endpoint</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Add existing model or create new?</FormLabel>
                <Select name="isExistingModel" value={formData.isExistingModel ? 'existing' : 'new'} onChange={handleModelTypeChange}>
                  <option value="new">Create New Model</option>
                  <option value="existing">Add Existing Model</option>
                </Select>
              </FormControl>
              {formData.isExistingModel ? (
                <FormControl>
                  <FormLabel>Select Existing Model</FormLabel>
                  <Select name="selectedExistingModel" value={formData.selectedExistingModel} onChange={handleInputChange}>
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
                    <Input name="modelName" value={formData.modelName} onChange={handleInputChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Model Version</FormLabel>
                    <Input name="modelVersion" value={formData.modelVersion} onChange={handleInputChange} />
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
