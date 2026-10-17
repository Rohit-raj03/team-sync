import { apiClient } from '../../../shared/api/apiClient.js';

/**
 * Profile Feature Service
 * Endpoints:
 * - GET  /users/profile
 * - PUT  /users/profile
 * - PUT  /users/change-password
 */
export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/users/profile', data);
    return response;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await apiClient.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },
};

export default profileService;

