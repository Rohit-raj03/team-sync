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

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.patch('/users/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete('/users/profile/image');
    return response;
  },
};

export default profileService;

