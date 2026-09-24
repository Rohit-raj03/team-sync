import { apiClient } from '../../../shared/api/apiClient.js';

export const notificationService = {
  getNotifications: () => apiClient.get('/notifications'),
};
