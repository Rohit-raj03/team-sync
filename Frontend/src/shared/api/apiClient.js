import axiosInstance from './axios.js';

export const apiClient = {
  get: (url, params) => axiosInstance.get(url, { params }),
  post: (url, data, config) => axiosInstance.post(url, data, config),
  put: (url, data, config) => axiosInstance.put(url, data, config),
  patch: (url, data, config) => axiosInstance.patch(url, data, config),
  delete: (url, dataOrConfig) => {
    if (dataOrConfig && dataOrConfig.data !== undefined) {
      return axiosInstance.delete(url, dataOrConfig);
    }
    return axiosInstance.delete(url, dataOrConfig ? { data: dataOrConfig } : undefined);
  },
};
