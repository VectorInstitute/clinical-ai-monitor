// src/app/api/auth.ts
import apiClient from './client';

export const login = async (username: string, password: string) => {
  const response = await apiClient.post('/login', { username, password });
  return response.data;
};
