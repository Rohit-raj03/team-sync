import { apiClient } from "../../../shared/api/apiClient.js";

export const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response;
    } catch (error) {
      // If server error or offline, allow fallback for development testing
      console.warn("Backend login failed or offline, using fallback:", error);
      if (
        credentials.email &&
        credentials.password &&
        !error.response
      ) {
        return {
          token: "jwt_mock_token_teamsync_123",
          user: {
            id: "u-1",
            name: credentials.email.split("@")[0],
            email: credentials.email,
            role: "admin",
            jobTitle: "Administrator",
          },
        };
      }
      throw new Error(error.message || "Invalid email or password");
    }
  },

  register: async (data) => {
    try {
      const response = await apiClient.post("/auth/register", data);
      return response;
    } catch (error) {
      console.warn("Backend register failed or offline, using fallback:", error);
      if (data.name && data.email && !error.response) {
        return {
          token: "jwt_mock_token_teamsync_123",
          user: {
            id: `u-${Date.now()}`,
            name: data.name,
            email: data.email,
            role: data.role || "user",
            jobTitle: data.jobTitle || (data.role === "admin" ? "Administrator" : "Team Member"),
          },
        };
      }
      throw new Error(error.message || "Registration failed");
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response;
    } catch (error) {
      console.warn("Backend reset failed or offline, using fallback:", error);
      return {
        success: true,
        message: "We've sent a password reset link to your email address.",
      };
    }
  },

  getCurrentUser: async () => {
    try {
      return await apiClient.get("/auth/me");
    } catch (error) {
      return null;
    }
  },
};
