import { apiClient } from '../../../shared/api/apiClient.js';

export const authService = {
  login: async (credentials) => {
    // Replace with: return apiClient.post('/auth/login', credentials);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'jwt_mock_token_abc123',
          user: {
            id: '1',
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: 'Product Lead',
          },
        });
      }, 500);
    });
  },
  register: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'jwt_mock_token_abc123',
          user: {
            id: '2',
            name: data.name,
            email: data.email,
            role: 'Team Member',
          },
        });
      }, 500);
    });
  },
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
};
