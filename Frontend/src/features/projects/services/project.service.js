import { apiClient } from '../../../shared/api/apiClient.js';

export const projectService = {
  getProjects: () => apiClient.get('/projects'),
  getProjectById: (id) => apiClient.get(`/projects/${id}`),
  createProject: (data) => apiClient.post('/projects', data),
};
