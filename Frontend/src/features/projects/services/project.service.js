import { apiClient } from "../../../shared/api/apiClient.js";

export const projectService = {
  getProjects: (params) => apiClient.get("/projects", params),
  getProjectById: (id) => apiClient.get(`/projects/${id}`),
  createProject: (data) => apiClient.post("/projects", data),
  updateProject: (id, data) => apiClient.patch(`/projects/${id}`, data),
  deleteProject: (id) => apiClient.delete(`/projects/${id}`),

  // Project Members
  getProjectMembers: (id) => apiClient.get(`/projects/${id}/members`),
  addProjectMember: (id, data) => apiClient.post(`/projects/${id}/members`, data),
  updateProjectMemberRole: (id, userId, data) =>
    apiClient.patch(`/projects/${id}/members/${userId}`, data),
  removeProjectMember: (id, userId) =>
    apiClient.delete(`/projects/${id}/members/${userId}`),
  getEligibleMembers: (id, params) =>
    apiClient.get(`/projects/${id}/eligible-members`, params),
};

export default projectService;
