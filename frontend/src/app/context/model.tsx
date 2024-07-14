'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { EndpointConfig, MetricConfig, SubgroupConfig } from '../configure/types/configure';

interface Model {
  id: number;
  name: string;
  description: string;
  endpointName: string;
}

interface ModelContextType {
  models: Model[];
  addModel: (model: Omit<Model, 'id'>, metrics: MetricConfig[], subgroups: SubgroupConfig[]) => Promise<void>;
  removeModel: (endpointName: string) => Promise<void>;
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
      const response = await fetch('/api/evaluation_endpoints');
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation endpoints');
      }
      const data = await response.json();
      const fetchedModels = data.endpoints.map((endpoint: any, index: number) => ({
        id: index + 1,
        name: endpoint.model_name,
        description: endpoint.model_description,
        endpointName: endpoint.endpoint_name,
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

  const addModel = useCallback(async (newModel: Omit<Model, 'id'>, metrics: MetricConfig[], subgroups: SubgroupConfig[]) => {
    try {
      const endpointConfig: EndpointConfig = {
        endpoint_name: newModel.endpointName,
        model_name: newModel.name,
        model_description: newModel.description,
        metrics,
        subgroups,
      };

      const response = await fetch('/api/create_evaluation_endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpointConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create evaluation endpoint');
      }

      const responseData = await response.json();
      console.log('API success response:', responseData);

      setModels(prevModels => [
        ...prevModels,
        { ...newModel, id: prevModels.length + 1 }
      ]);

      localStorage.removeItem(CACHE_KEY);
      await fetchModels();
    } catch (error) {
      console.error('Error adding model:', error);
      throw error;
    }
  }, [fetchModels]);

  const removeModel = useCallback(async (endpointName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/delete_evaluation_endpoint/${endpointName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete evaluation endpoint');
      }

      setModels(prevModels => prevModels.filter(model => model.endpointName !== endpointName));
      localStorage.removeItem(CACHE_KEY);
      await fetchModels();
    } catch (error) {
      console.error('Error removing model:', error);
      throw error;
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
