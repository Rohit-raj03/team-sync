import { apiClient } from "../../../shared/api/apiClient.js";

export const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response;
    } catch (error) {
      if (error.status === 401 || error.status === 400 || error.status === 403) {
        throw error;
      }
      if (error.message?.includes("Network Error") || !error.status) {
        throw new Error("Unable to connect to the server. Please check your network or server status.");
      }
      throw error;
    }
  },

  register: async (data) => {
    try {
      const response = await apiClient.post("/auth/register", data);
      return response;
    } catch (error) {
      if (error.status === 400 || error.status === 409 || error.status === 403) {
        throw error;
      }
      if (error.message?.includes("Network Error") || !error.status) {
        throw new Error("Unable to connect to the server. Please check your network or server status.");
      }
      throw error;
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await apiClient.post("/auth/google", { credential });
      return response;
    } catch (error) {
      if (error.status === 401 || error.status === 400 || error.status === 403) {
        throw error;
      }
      if (error.message?.includes("Network Error") || !error.status) {
        throw new Error("Unable to connect to the server. Please check your network or server status.");
      }
      throw error;
    }
  },

  requestPasswordReset: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response;
  },

  resetPassword: async ({ token, newPassword }) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response;
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response;
    } catch (error) {
      return null;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post("/auth/logout", {}, { withCredentials: true });
      return response;
    } catch {
      // Best effort: allow logout even if network/server is unavailable
      return null;
    }
  },
};

export default authService;
