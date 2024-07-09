'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { ServerConfig, MetricConfig, SubgroupConfig } from '../configure/types/configure';

interface Model {
  id: number;
  name: string;
  description: string;
  serverName: string;
}

interface ModelContextType {
  models: Model[];
  addModel: (model: Omit<Model, 'id'>, metrics: MetricConfig[], subgroups: SubgroupConfig[]) => Promise<void>;
  removeModel: (serverName: string) => Promise<void>;
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
      const response = await fetch('/api/evaluation_servers');
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation servers');
      }
      const data = await response.json();
      const fetchedModels = data.servers.map((server: any, index: number) => ({
        id: index + 1,
        name: server.model_name,
        description: server.model_description,
        serverName: server.server_name,
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
      const serverConfig: ServerConfig = {
        server_name: newModel.serverName,
        model_name: newModel.name,
        model_description: newModel.description,
        metrics,
        subgroups,
      };

      const response = await fetch('/api/create_evaluation_server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create evaluation server');
      }

      // Only update the local state if the server creation was successful
      setModels(prevModels => [
        ...prevModels,
        { ...newModel, id: prevModels.length + 1 }
      ]);

      // Clear the cache to ensure fresh data on next fetch
      localStorage.removeItem(CACHE_KEY);

      // Fetch updated data from the server
      await fetchModels();
    } catch (error) {
      console.error('Error adding model:', error);
      throw error; // Re-throw the error so it can be caught in the component
    }
  }, [fetchModels]);

  const removeModel = useCallback(async (serverName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/delete_evaluation_server/${serverName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete evaluation server');
      }

      setModels(prevModels => prevModels.filter(model => model.serverName !== serverName));
      localStorage.removeItem(CACHE_KEY); // Clear cache after deletion
      await fetchModels(); // Fetch updated data from the server
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
    <ModelContext.Provider value={{ models, addModel, removeModel, fetchModels, isLoading }}>
      {children}
    </ModelContext.Provider>
  );
};
