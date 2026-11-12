import axios from 'axios';
import { env } from '../../config/env.js';
import { storage } from '../utils/localStorage.js';
import { store } from '../../app/store.js';
import { logout } from '../../features/auth/store/authSlice.js';
import { clearTeamCache } from '../../features/team/hooks/useTeam.js';
import { clearNotificationsCache } from '../../features/notifications/hooks/useNotifications.js';

const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleSessionTermination = () => {
  storage.remove('auth_token');
  storage.remove('auth_user');
  storage.remove('auth_refresh_token');
  try {
    store.dispatch(logout());
    clearTeamCache();
    clearNotificationsCache();
  } catch (e) {
    console.error('Failed to dispatch logout on 401:', e);
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

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
  async (error) => {
    const originalRequest = error.config;
    const isAuthAttempt =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/google') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/refresh');

    const refreshToken = storage.get('auth_refresh_token');

    // Silent token refresh interceptor with queueing and session rotation
    if (
      error.response?.status === 401 &&
      !isAuthAttempt &&
      !originalRequest?._retry &&
      refreshToken
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${env.API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        const data = res.data?.data || res.data;
        const newAccessToken = data?.accessToken || data?.token;
        if (newAccessToken) {
          storage.set('auth_token', newAccessToken);
          if (data?.refreshToken) {
            storage.set('auth_refresh_token', data.refreshToken);
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        handleSessionTermination();
      } finally {
        isRefreshing = false;
      }
    } else if (error.response?.status === 401 && !isAuthAttempt) {
      handleSessionTermination();
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
