'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ModelFacts } from '../model/[id]/types/facts';

interface ModelBasicInfo {
  name: string;
  version: string;
}

interface ModelData {
  id: string;
  endpoints: string[];
  basic_info: ModelBasicInfo;
  facts: ModelFacts | null;
}

interface ModelContextType {
  models: ModelData[];
  fetchModels: () => Promise<void>;
  getModelById: (id: string) => Promise<ModelData | undefined>;
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
      const modelArray = Object.entries(data).map(([id, modelInfo]: [string, any]) => ({
        id,
        ...modelInfo,
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
      const newModel: ModelData = { id, ...data };
      setModels(prevModels => [...prevModels, newModel]);
      return newModel;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [models, apiRequest]);

  const contextValue = useMemo(() => ({
    models,
    fetchModels,
    getModelById,
    isLoading
  }), [models, fetchModels, getModelById, isLoading]);

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};
