'use client'

import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { ModelFacts } from '../types/facts';
import { Criterion, EvaluationFrequency } from '../types/evaluation-criteria';
import { ModelData } from '../types/model';
import { useAuth } from './auth';
import { debounce, DebouncedFunc } from 'lodash';

interface ModelContextType {
  models: ModelData[];
  fetchModels: () => Promise<void>;
  getModelById: (id: string) => Promise<ModelData | undefined>;
  updateModelFacts: DebouncedFunc<(id: string, facts: ModelFacts) => Promise<void>>;
  fetchEvaluationCriteria: (modelId: string) => Promise<Criterion[]>;
  updateEvaluationCriteria: (modelId: string, criteria: Criterion[]) => Promise<void>;
  updateEvaluationFrequency: (modelId: string, frequency: EvaluationFrequency) => Promise<void>;
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
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }, [getToken]);

  const fetchModels = useCallback(async () => {
    if (!isAuthenticated()) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<Record<string, any>>('/api/models');
      const modelArray = await Promise.all(Object.entries(data).map(async ([id, modelInfo]: [string, any]) => {
        const safetyData = await apiRequest<{ overall_status: string }>(`/api/model/${id}/safety`);
        return {
          id,
          ...modelInfo,
          overall_status: safetyData.overall_status
        } as ModelData;
      }));
      setModels(modelArray);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest, isAuthenticated]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const getModelById = useCallback(async (id: string): Promise<ModelData | undefined> => {
    setIsLoading(true);
    try {
      const cachedModel = models.find(m => m.id === id);
      if (cachedModel && cachedModel.facts && cachedModel.evaluation_frequency) {
        return cachedModel;
      }

      const [modelData, safetyData, factsData] = await Promise.all([
        apiRequest<ModelData>(`/api/models/${id}`),
        apiRequest<{ overall_status: string }>(`/api/model/${id}/safety`),
        apiRequest<ModelFacts>(`/api/models/${id}/facts`)
      ]);

      const newModel: ModelData = {
        ...modelData,
        overall_status: safetyData.overall_status,
        facts: factsData,
        evaluation_frequency: modelData.evaluation_frequency || { value: 30, unit: 'days' }
      };

      setModels(prevModels => {
        const index = prevModels.findIndex(m => m.id === id);
        if (index !== -1) {
          const updatedModels = [...prevModels];
          updatedModels[index] = newModel;
          return updatedModels;
        }
        return [...prevModels, newModel];
      });

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
        method: 'POST',
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

  const fetchEvaluationCriteria = useCallback(async (modelId: string): Promise<Criterion[]> => {
    try {
      const criteria = await apiRequest<Criterion[]>(`/api/models/${modelId}/evaluation-criteria`);
      return criteria.map(criterion => ({
        ...criterion,
        display_name: criterion.display_name || criterion.metric_name
      }));
    } catch (error) {
      console.error('Error fetching evaluation criteria:', error);
      throw error;
    }
  }, [apiRequest]);

  const updateEvaluationCriteria = useCallback(async (modelId: string, criteria: Criterion[]) => {
    try {
      await apiRequest(`/api/models/${modelId}/evaluation-criteria`, {
        method: 'POST',
        body: JSON.stringify(criteria.map(({ id, metric_name, display_name, operator, threshold }) => ({
          id,
          metric_name,
          display_name,
          operator,
          threshold
        }))),
      });
    } catch (error) {
      console.error('Error updating evaluation criteria:', error);
      throw error;
    }
  }, [apiRequest]);

  const updateEvaluationFrequency = useCallback(async (modelId: string, frequency: EvaluationFrequency) => {
    try {
      await apiRequest(`/api/models/${modelId}/evaluation-frequency`, {
        method: 'POST',
        body: JSON.stringify(frequency),
      });
    } catch (error) {
      console.error('Error updating evaluation frequency:', error);
      throw error;
    }
  }, [apiRequest]);

  const debouncedUpdateModelFacts = useMemo(
    () => debounce(updateModelFacts, 300) as DebouncedFunc<typeof updateModelFacts>,
    [updateModelFacts]
  );

  const contextValue = useMemo(() => ({
    models,
    fetchModels,
    getModelById,
    updateModelFacts: debouncedUpdateModelFacts,
    fetchEvaluationCriteria,
    updateEvaluationCriteria,
    updateEvaluationFrequency,
    isLoading
  }), [models, fetchModels, getModelById, debouncedUpdateModelFacts, fetchEvaluationCriteria, updateEvaluationCriteria, updateEvaluationFrequency, isLoading]);

  return (
    <ModelContext.Provider value={contextValue}>
      {children}
    </ModelContext.Provider>
  );
};
