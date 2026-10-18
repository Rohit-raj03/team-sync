import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notification.service.js";

/**
 * Feature Hook: useNotifications
 * Connects directly to backend /api/notifications. Zero dummy data.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      const list = res?.notifications || res?.data || [];
      if (Array.isArray(list)) {
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.read && !n.isRead).length);
      }
    } catch (err) {
      console.warn("Could not fetch notifications from backend:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      // optimistic update
    }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true, unread: false }))
    );
    setUnreadCount(0);
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      // optimistic update
    }
    setNotifications((prev) =>
      prev.map((n) =>
        (n.id || n._id) === id
          ? { ...n, read: true, isRead: true, unread: false }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    markAsRead,
    refreshNotifications: fetchNotifications,
  };
}

export default useNotifications;
