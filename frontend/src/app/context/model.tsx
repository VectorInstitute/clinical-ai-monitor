'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';

interface Model {
  id: string;
  name: string;
  description: string;
  endpointId: string;
}

interface ModelContextType {
  models: Model[];
  addModel: (model: Omit<Model, 'id'>) => Promise<void>;
  removeModel: (id: string) => Promise<void>;
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
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addModel = useCallback(async (newModel: Omit<Model, 'id'>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModel),
      });

      if (!response.ok) {
        throw new Error('Failed to add model');
      }

      const addedModel = await response.json();
      setModels(prev => [...prev, addedModel]);
    } catch (error) {
      console.error('Error adding model:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeModel = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove model');
      }

      setModels(prev => prev.filter(model => model.id !== id));
    } catch (error) {
      console.error('Error removing model:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    models,
    addModel,
    removeModel,
    isLoading
  }), [models, addModel, removeModel, isLoading]);

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};
