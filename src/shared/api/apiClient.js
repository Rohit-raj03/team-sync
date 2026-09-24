import axiosInstance from './axios.js';

export const apiClient = {
  get: (url, params) => axiosInstance.get(url, { params }),
  post: (url, data) => axiosInstance.post(url, data),
  put: (url, data) => axiosInstance.put(url, data),
  patch: (url, data) => axiosInstance.patch(url, data),
  delete: (url) => axiosInstance.delete(url),
};
