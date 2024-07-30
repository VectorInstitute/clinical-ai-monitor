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

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
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
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const getModelById = useCallback(async (id: string) => {
    const model = models.find(m => m.id === id);
    if (model) {
      return model;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch model');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [models]);

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
