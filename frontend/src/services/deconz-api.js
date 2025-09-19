import axios from 'axios';

const apiKey = import.meta.env.VITE_DECONZ_API_KEY;
const deconzGateway = import.meta.env.VITE_DECONZ_GATEWAY_URL;

const API_URL = `${deconzGateway}/api/${apiKey}`;

export const getAlarmsystems = async () => {
  const response = await axios.get(`${API_URL}/alarmsystems`);
  return response.data;
};

export const getConfig = async () => {
  const response = await axios.get(`${API_URL}/config`);
  return response.data;
};

export const getGroups = async () => {
  const response = await axios.get(`${API_URL}/groups`);
  return response.data;
};

export const getLights = async () => {
  const response = await axios.get(`${API_URL}/lights`);
  const data = response.data;

  const lightsWithId = Object.entries(data).map(([id, light]) => ({
    id,
    ...light,
  }));

  return lightsWithId;
};

export const getResourcelinks = async () => {
  const response = await axios.get(`${API_URL}/resourcelinks`);
  return response.data;
};

export const getRules = async () => {
  const response = await axios.get(`${API_URL}/rules`);
  return response.data;
};

export const getScenes = async () => {
  const response = await axios.get(`${API_URL}/scenes`);
  return response.data;
};

export const getSchedules = async () => {
  const response = await axios.get(`${API_URL}/schedules`);
  return response.data;
};

export const getSensors = async () => {
  const response = await axios.get(`${API_URL}/sensors`);
  return response.data;
};

export const setLightState = async (id, state) => {
  console.log(state);
  const response = await axios.put(`${API_URL}/lights/${id}/state`, state);
  return response.data;
};

export const renameLight = async (id, newName) => {
  if (!id || !newName) throw new Error('Light ID and new name are required');

  const response = await axios.put(`${API_URL}/lights/${id}`, {
    name: newName,
  });

  return response.data;
};

export const createDeconzApiKey = async (deviceType = 'my-app#frontend') => {
  const response = await axios.post(`${deconzGateway}/api`, {
    devicetype: deviceType,
  });
  return response.data;
};
