import axios from 'axios';
import { env } from '../../config/env.js';
import { storage } from '../utils/localStorage.js';

const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove('auth_token');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosInstance;
