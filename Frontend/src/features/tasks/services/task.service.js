import { apiClient } from "../../../shared/api/apiClient.js";

export const taskService = {
  getTasks: async (params) => apiClient.get("/tasks", params),
  getProjectTasks: async (projectId, params) =>
    apiClient.get(`/projects/${projectId}/tasks`, params),
  getTaskById: async (id) => apiClient.get(`/tasks/${id}`),
  createTask: async (data) => apiClient.post("/tasks", data),
  updateTask: async (id, data) => apiClient.patch(`/tasks/${id}`, data),
  deleteTask: async (id, reason) =>
    apiClient.delete(`/tasks/${id}`, typeof reason === "string" ? { reason } : reason),
  toggleSubtask: async (taskId, subtaskId) =>
    apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}`),
  getTaskComments: async (taskId) =>
    apiClient.get(`/tasks/${taskId}/comments`),
  createTaskComment: async (taskId, data) =>
    apiClient.post(`/tasks/${taskId}/comments`, data),
  deleteTaskComment: async (taskId, commentId) =>
    apiClient.delete(`/tasks/${taskId}/comments/${commentId}`),
  clearTaskComments: async (taskId) =>
    apiClient.delete(`/tasks/${taskId}/comments`),
};

export default taskService;
