'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { MetricConfig } from '../configure/types/configure';
import { ModelFacts } from '../model/[id]/types/facts';

interface Endpoint {
  name: string;
  metrics: string[];
  models: string[];
}

interface EndpointContextType {
  endpoints: Endpoint[];
  addEndpoint: (metrics: MetricConfig[]) => Promise<void>;
  removeEndpoint: (name: string) => Promise<void>;
  addModelToEndpoint: (endpointName: string, modelName: string, modelVersion: string, isExistingModel: boolean) => Promise<void>;
  removeModelFromEndpoint: (endpointName: string, modelId: string) => Promise<void>;
  updateModelFacts: (modelId: string, modelFacts: ModelFacts) => Promise<void>;
  isLoading: boolean;
}

const EndpointContext = createContext<EndpointContextType | undefined>(undefined);

export const useEndpointContext = () => {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error('useEndpointContext must be used within an EndpointProvider');
  }
  return context;
};

export const EndpointProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEndpoints = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/endpoints');
      if (!response.ok) {
        throw new Error('Failed to fetch endpoints');
      }
      const data = await response.json();
      setEndpoints(data.endpoints);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const addEndpoint = useCallback(async (metrics: MetricConfig[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });

      if (!response.ok) {
        throw new Error('Failed to create endpoint');
      }

      await fetchEndpoints();
    } catch (error) {
      console.error('Error adding endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoints]);

  const removeEndpoint = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/endpoints/${name}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete endpoint');
      }

      await fetchEndpoints();
    } catch (error) {
      console.error('Error removing endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoints]);

  const addModelToEndpoint = useCallback(async (endpointName: string, modelName: string, modelVersion: string, isExistingModel: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/endpoints/${endpointName}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName, version: modelVersion, isExistingModel }),
      });

      if (!response.ok) {
        throw new Error('Failed to add model to endpoint');
      }

      await fetchEndpoints();
    } catch (error) {
      console.error('Error adding model to endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoints]);

  const updateModelFacts = useCallback(async (modelId: string, modelFacts: ModelFacts) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/models/${modelId}/facts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelFacts),
      });

      if (!response.ok) {
        throw new Error('Failed to update model facts');
      }

      await fetchEndpoints();
    } catch (error) {
      console.error('Error updating model facts:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoints]);

  const removeModelFromEndpoint = useCallback(async (endpointName: string, modelId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/endpoints/${endpointName}/models/${modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove model from endpoint');
      }

      await fetchEndpoints();
    } catch (error) {
      console.error('Error removing model from endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchEndpoints]);

  const contextValue = useMemo(() => ({
    endpoints,
    addEndpoint,
    removeEndpoint,
    addModelToEndpoint,
    removeModelFromEndpoint,
    updateModelFacts,
    isLoading
  }), [endpoints, addEndpoint, removeEndpoint, addModelToEndpoint, removeModelFromEndpoint, updateModelFacts, isLoading]);

  return (
    <EndpointContext.Provider value={contextValue}>
      {children}
    </EndpointContext.Provider>
  );
};
