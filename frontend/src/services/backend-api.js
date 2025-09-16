import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const backendApi = axios.create({
  baseURL: backendUrl,
});

backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = async (username, password) => {
  const response = await backendApi.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (username, password, role = 'user') => {
  const response = await backendApi.post('/auth/register', { username, password, role });
  return response.data;
};

export const getDeconzApiKey = async () => {
  const response = await backendApi.get('/users/deconz-api-key');
  return response.data;
};

export const postDeconzApiKey = async (apiKey) => {
  const response = await backendApi.post('/users/deconz-api-key', { apiKey });
  return response.data;
};

export const deleteDeconzApiKey = async () => {
  const response = await backendApi.delete('/users/deconz-api-key');
  return response.data;
};

export default backendApi;
