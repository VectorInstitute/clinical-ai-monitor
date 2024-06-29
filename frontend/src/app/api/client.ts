// app/api/client.ts
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/login', { username, password })
  return response.data
}

export const getModels = async () => {
  const response = await apiClient.get('/models')
  return response.data
}

export const getModelHealth = async (modelId: number) => {
  const response = await apiClient.get(`/model/${modelId}/health`)
  return response.data
}

export const getModelFacts = async (modelId: number) => {
  const response = await apiClient.get(`/model/${modelId}/facts`)
  return response.data
}
