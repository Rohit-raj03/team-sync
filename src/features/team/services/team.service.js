import { apiClient } from '../../../shared/api/apiClient.js';

export const teamService = {
  getMembers: () => apiClient.get('/team/members'),
  inviteMember: (data) => apiClient.post('/team/invite', data),
};
