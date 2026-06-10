import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
});

export const TOKEN_KEY = 'tillwedo_token';

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data, // -> { success, message, data }
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;
    if (status === 401) localStorage.removeItem(TOKEN_KEY);

    const err = new Error(body?.message || error.message || 'Request failed');
    err.status = status;
    err.errorCode = body?.errorCode;
    return Promise.reject(err);
  }
);

export default client;