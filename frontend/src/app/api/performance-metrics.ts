import { AxiosError } from 'axios';
import { PerformanceDataSchema, PerformanceData } from '../model/[id]/types/performance-metrics';
import apiClient from './client';

export const getPerformanceMetrics = async (endpointName: string): Promise<PerformanceData> => {
  try {
    const response = await apiClient.get<PerformanceData>(`/performance_metrics/${endpointName}`);
    const validatedData = PerformanceDataSchema.parse(response.data);
    return validatedData;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Axios error:', error.response?.status, error.response?.data);
      throw new Error(`Failed to fetch performance metrics: ${error.message}`);
    }
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred while fetching performance metrics');
  }
};
