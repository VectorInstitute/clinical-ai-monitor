// src/app/api/models.ts
import apiClient from './client';

export const getModels = async () => {
  const response = await apiClient.get('/models');
  return response.data;
};

export const getModelHealth = async (modelId: number) => {
  const response = await apiClient.get(`/model/${modelId}/health`);
  return response.data;
};

export const getModelFacts = async (modelId: number) => {
  const response = await apiClient.get(`/model/${modelId}/facts`);
  return response.data;
};
