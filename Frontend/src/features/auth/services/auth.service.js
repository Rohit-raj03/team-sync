import { apiClient } from "../../../shared/api/apiClient.js";

export const authService = {
  login: async (credentials) => {
    // Replace with: return apiClient.post('/auth/login', credentials);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: "jwt_mock_token_abc123",
          user: {
            id: "1",
            name: credentials.email.split("@")[0],
            email: credentials.email,
            role: "Product Lead",
          },
        });
      }, 500);
    });
  },
  register: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: "jwt_mock_token_abc123",
          user: {
            id: "2",
            name: data.name,
            email: data.email,
            role: "Team Member",
          },
        });
      }, 500);
    });
  },
  requestPasswordReset: async (email) => {
    // Replace with: return apiClient.post('/auth/forgot-password', { email });
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Allows testing the retryable error state when email contains 'error' or 'fail'
        if (
          email.toLowerCase().includes("fail") ||
          email.toLowerCase().includes("error")
        ) {
          reject(
            new Error(
              "Unable to connect to the reset service. Please check your connection and try again.",
            ),
          );
        } else {
          // Generic security response: never reveal whether account exists
          resolve({
            success: true,
            message: "We've sent a password reset link to your email address.",
          });
        }
      }, 700);
    });
  },
  getCurrentUser: async () => {
    return apiClient.get("/auth/me");
  },
};
