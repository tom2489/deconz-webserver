import axios from 'axios';

const defaultHost = window.location.hostname; // this will give machine IP if accessed via IP
const backendPort = 3000;
const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${defaultHost}:${backendPort}`;

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

export const register = async (username, password, roles = ['user']) => {
  const response = await backendApi.post('/auth/register', { username, password, roles });
  return response.data;
};

export const getAllUsers = async () => {
  const response = await backendApi.get('/users');
  return response.data.users;
};

export const deleteUser = async (userId) => {
  const response = await backendApi.delete(`/users/${userId}`);
  return response.data;
};

export const updateUserRoles = async (userId, roles) => {
  const response = await backendApi.put(`/users/${userId}/roles`, { roles });
  return response.data;
};

export const removeUserRole = async (userId, role) => {
  const response = await backendApi.delete(`/users/${userId}/roles/${role}`);
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
