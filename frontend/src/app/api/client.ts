import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://0.0.0.0:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

apiClient.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
}, error => {
  console.log('Response Error:', error);
  return Promise.reject(error);
});

export default apiClient;
