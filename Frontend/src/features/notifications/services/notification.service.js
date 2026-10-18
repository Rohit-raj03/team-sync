import { apiClient } from "../../../shared/api/apiClient.js";

export const notificationService = {
  getNotifications: () => apiClient.get("/notifications"),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
};

export default notificationService;
