import axios from 'axios';
import { env } from '../../config/env.js';
import { storage } from '../utils/localStorage.js';

const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure FormData payloads do not inherit an explicit application/json Content-Type,
    // allowing Axios and the browser to set 'multipart/form-data; boundary=...'
    if (config.data instanceof FormData) {
      if (config.headers?.delete) {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      storage.remove('auth_token');
      storage.remove('auth_user');
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export default axiosInstance;
