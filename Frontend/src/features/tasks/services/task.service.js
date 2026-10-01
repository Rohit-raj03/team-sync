import { apiClient } from '../../../shared/api/apiClient.js';

export const taskService = {
  getTasks: async (params) => apiClient.get('/tasks', params),
  getTaskById: async (id) => apiClient.get(`/tasks/${id}`),
  createTask: async (data) => apiClient.post('/tasks', data),
  updateTask: async (id, data) => apiClient.put(`/tasks/${id}`, data),
  deleteTask: async (id) => apiClient.delete(`/tasks/${id}`),
};
