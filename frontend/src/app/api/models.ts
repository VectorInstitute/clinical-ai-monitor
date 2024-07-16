import apiClient from './client';
import { EndpointConfig, EvaluationInput } from '../configure/types/configure';

export const getEndpoints = async () => {
  const response = await apiClient.get('/endpoints');
  return response.data;
};

export const getEndpoint = async (endpointId: string) => {
  const response = await apiClient.get(`/endpoints/${endpointId}`);
  return response.data;
};

export const createEndpoint = async (config: EndpointConfig) => {
  const response = await apiClient.post('/endpoints', config);
  return response.data;
};

export const updateEndpoint = async (endpointId: string, config: Partial<EndpointConfig>) => {
  const response = await apiClient.put(`/endpoints/${endpointId}`, config);
  return response.data;
};

export const deleteEndpoint = async (endpointId: string) => {
  const response = await apiClient.delete(`/endpoints/${endpointId}`);
  return response.data;
};

export const getEndpointLogs = async (endpointId: string) => {
  const response = await apiClient.get(`/endpoints/${endpointId}/logs`);
  return response.data;
};

export const getModels = async () => {
  const response = await apiClient.get('/models');
  return response.data;
};

export const getModel = async (modelId: string) => {
  const response = await apiClient.get(`/models/${modelId}`);
  return response.data;
};

export const getModelHealth = async (modelId: string) => {
  const response = await apiClient.get(`/models/${modelId}/health`);
  return response.data;
};

export const getModelPerformance = async (modelId: string) => {
  const response = await apiClient.get(`/models/${modelId}/performance`);
  return response.data;
};

export const getModelFacts = async (modelId: string) => {
  const response = await apiClient.get(`/models/${modelId}/facts`);
  return response.data;
};

export const evaluateModel = async (modelId: string, data: EvaluationInput) => {
  const response = await apiClient.post(`/models/${modelId}/evaluate`, data);
  return response.data;
};
