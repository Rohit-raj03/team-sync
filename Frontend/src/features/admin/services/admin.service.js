import { apiClient } from '../../../shared/api/apiClient.js';

/**
 * Service: Admin API Service
 * Layer: features/admin/services/
 * Responsibility: Live communications with backend administrative endpoints.
 */
export const adminService = {
  getStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res;
  },

  getUsers: async (params = {}) => {
    const res = await apiClient.get('/admin/users', params);
    return res;
  },

  createUser: async (userData) => {
    const res = await apiClient.post('/admin/users', userData);
    return res;
  },

  updateUserRole: async (id, role) => {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return res;
  },

  toggleUserStatus: async (id, isActive) => {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
    return res;
  },

  deleteUser: async (id) => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res;
  },
};

export default adminService;
