'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ModelFacts } from '../configure/types/facts'

interface ModelBasicInfo {
  name: string;
  version: string;
}

interface ModelData {
  id: string;
  endpoints: string[];
  basic_info: ModelBasicInfo;
  facts: ModelFacts | null;
  overall_status: string;
}

interface ModelContextType {
  models: ModelData[];
  fetchModels: () => Promise<void>;
  getModelById: (id: string) => Promise<ModelData | undefined>;
  updateModelFacts: (id: string, facts: ModelFacts) => Promise<void>;
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

export const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<ModelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }, []);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/models');
      const modelArray = await Promise.all(Object.entries(data).map(async ([id, modelInfo]: [string, any]) => {
        const safetyData = await apiRequest(`/api/model/${id}/safety`);
        return {
          id,
          ...modelInfo,
          overall_status: safetyData.overall_status
        };
      }));
      setModels(modelArray);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const getModelById = useCallback(async (id: string): Promise<ModelData> => {
    const cachedModel = models.find(m => m.id === id);
    if (cachedModel) {
      return cachedModel;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/models/${id}`);
      const safetyData = await apiRequest(`/api/model/${id}/safety`);
      const newModel: ModelData = {
        id,
        ...data,
        overall_status: safetyData.overall_status
      };
      setModels(prevModels => [...prevModels, newModel]);
      return newModel;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [models, apiRequest]);

  const updateModelFacts = useCallback(async (id: string, facts: ModelFacts) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/models/${id}/facts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facts),
      });

      setModels(prevModels => prevModels.map(model =>
        model.id === id ? { ...model, facts } : model
      ));
    } catch (error) {
      console.error('Error updating model facts:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  const contextValue = useMemo(() => ({
    models,
    fetchModels,
    getModelById,
    updateModelFacts,
    isLoading
  }), [models, fetchModels, getModelById, updateModelFacts, isLoading]);

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};
