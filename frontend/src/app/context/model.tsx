'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { EndpointConfig } from '../configure/types/configure';
import { getEndpoints, createEndpoint, deleteEndpoint } from '../api/models';

interface Model {
  modelId: string;
  endpointName: string;
  modelName: string;
  modelDescription: string;
}

interface ModelContextType {
  models: Model[];
  addModel: (config: EndpointConfig) => Promise<void>;
  removeModel: (modelId: string) => Promise<void>;
  fetchModels: () => Promise<void>;
  isLoading: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const useModelContext = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModelContext must be used within a ModelProvider');
  }
  return context;
};

const CACHE_KEY = 'modelCache';
const CACHE_EXPIRY = 30 * 1000; // 30 seconds

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEndpoints();
      const fetchedModels = data.endpoints.map((endpoint: any) => ({
        modelId: endpoint.model_id,
        endpointName: endpoint.endpoint_name,
        modelName: endpoint.model_name,
        modelDescription: endpoint.model_description,
      }));
      setModels(fetchedModels);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: fetchedModels, timestamp: Date.now() }));
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        setModels(data);
        setIsLoading(false);
      } else {
        fetchModels();
      }
    } else {
      fetchModels();
    }
  }, [fetchModels]);

  const addModel = useCallback(async (config: EndpointConfig) => {
    try {
      const responseData = await createEndpoint(config);
      console.log('API success response:', responseData);
      await fetchModels();
    } catch (error) {
      console.error('Error adding model:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add model: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred while adding the model');
      }
    }
  }, [fetchModels]);

  const removeModel = useCallback(async (modelId: string) => {
    setIsLoading(true);
    try {
      await deleteEndpoint(modelId);
      setModels(prevModels => prevModels.filter(model => model.modelId !== modelId));
      localStorage.removeItem(CACHE_KEY);
      await fetchModels();
    } catch (error) {
      console.error('Error removing model:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to remove model: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred while removing the model');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchModels]);

  const contextValue = useMemo(() => ({
    models,
    addModel,
    removeModel,
    fetchModels,
    isLoading
  }), [models, addModel, removeModel, fetchModels, isLoading]);

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};
