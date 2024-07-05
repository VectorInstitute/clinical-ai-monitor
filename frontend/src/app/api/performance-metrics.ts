import type { NextApiRequest, NextApiResponse } from 'next'
import apiClient from './client'
import { PerformanceData } from '../model/[id]/types/performance-metrics'

export default async function handler(req: NextApiRequest, res: NextApiResponse<PerformanceData | { error: string }>) {
  try {
    const backendResponse = await apiClient.get<PerformanceData>('/performance-metrics')
    res.status(200).json(backendResponse.data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance metrics' })
  }
}

export const getPerformanceMetrics = async (): Promise<PerformanceData> => {
  const response = await apiClient.get<PerformanceData>('/performance-metrics')
  return response.data
}