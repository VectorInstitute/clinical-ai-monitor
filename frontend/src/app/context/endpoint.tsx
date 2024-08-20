'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { EndpointConfig } from '../configure/types/configure';
import { ModelFacts } from '../configure/types/facts';
import { useAuth } from './auth';

interface Endpoint {
  name: string;
  metrics: string[];
  models: string[];
}

interface EndpointContextType {
  endpoints: Endpoint[];
  addEndpoint: (config: EndpointConfig) => Promise<void>;
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
  const { getToken, isAuthenticated } = useAuth();

  const apiRequest = useCallback(async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }, [getToken]);

  const fetchEndpoints = useCallback(async () => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<{ endpoints: Endpoint[] }>('/api/endpoints');
      setEndpoints(data.endpoints);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, isAuthenticated]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const addEndpoint = useCallback(async (config: EndpointConfig) => {
    setIsLoading(true);
    try {
      await apiRequest('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      await fetchEndpoints();
    } catch (error) {
      console.error('Error adding endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchEndpoints]);

  const removeEndpoint = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/endpoints/${name}`, { method: 'DELETE' });
      await fetchEndpoints();
    } catch (error) {
      console.error('Error removing endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchEndpoints]);

  const addModelToEndpoint = useCallback(async (endpointName: string, modelName: string, modelVersion: string, isExistingModel: boolean) => {
    setIsLoading(true);
    try {
      const endpoint = endpoints.find(e => e.name === endpointName);
      if (endpoint) {
        const isDuplicate = endpoint.models.some(modelId => {
          const [name, version] = modelId.split('|');
          return name === modelName && version === modelVersion;
        });

        if (isDuplicate) {
          throw new Error('A model with the same name and version already exists in this endpoint.');
        }
      }

      await apiRequest(`/api/endpoints/${endpointName}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, version: modelVersion, isExistingModel }),
      });
      await fetchEndpoints();
    } catch (error) {
      console.error('Error adding model to endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [endpoints, apiRequest, fetchEndpoints]);

  const updateModelFacts = useCallback(async (modelId: string, modelFacts: ModelFacts) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/models/${modelId}/facts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelFacts),
      });
      await fetchEndpoints();
    } catch (error) {
      console.error('Error updating model facts:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchEndpoints]);

  const removeModelFromEndpoint = useCallback(async (endpointName: string, modelId: string) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/endpoints/${endpointName}/models/${modelId}`, { method: 'DELETE' });
      await fetchEndpoints();
    } catch (error) {
      console.error('Error removing model from endpoint:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, fetchEndpoints]);

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
