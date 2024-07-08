'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/evaluation_servers');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch evaluation servers');
      }
      const data = await response.json();
      const fetchedModels = data.servers.map((server: any, index: number) => ({
        id: index + 1,
        name: server.model_name,
        description: server.model_description,
        serverName: server.server_name,
      }));
      setModels(fetchedModels);
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const addModel = async (newModel: Omit<Model, 'id'>, metrics: MetricConfig[], subgroups: SubgroupConfig[]) => {
    try {
      const serverConfig: ServerConfig = {
        server_name: newModel.serverName,
        model_name: newModel.name,
        model_description: newModel.description,
        metrics: metrics,
        subgroups: subgroups,
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

      const createdServer = await response.json();
      setModels(prevModels => [
        ...prevModels,
        { ...newModel, id: prevModels.length + 1 },
      ]);
      return createdServer;
    } catch (error) {
      console.error('Error adding model:', error);
      throw error;
    }
  };

  const removeModel = async (serverName: string) => {
    try {
      const response = await fetch(`/api/delete_evaluation_server/${serverName}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete evaluation server');
      }

      setModels(prevModels => prevModels.filter(model => model.serverName !== serverName));
    } catch (error) {
      console.error('Error removing model:', error);
      throw error;
    }
  };

  return (
    <ModelContext.Provider value={{ models, addModel, removeModel, fetchModels }}>
      {children}
    </ModelContext.Provider>
  );
};
