import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notification.service.js";

let sharedNotificationsList = [];
let sharedUnreadCount = 0;
const notificationListeners = new Set();
let inFlightNotificationsPromise = null;
let lastNotificationsFetchTimestamp = 0;
const NOTIFICATIONS_CACHE_TTL_MS = 15000;

const notifyNotificationListeners = () => {
  notificationListeners.forEach((listener) =>
    listener({ notifications: [...sharedNotificationsList], unreadCount: sharedUnreadCount })
  );
};

export const clearNotificationsCache = () => {
  sharedNotificationsList = [];
  sharedUnreadCount = 0;
  lastNotificationsFetchTimestamp = 0;
  inFlightNotificationsPromise = null;
  notifyNotificationListeners();
};

/**
 * Feature Hook: useNotifications
 * Connects directly to backend /api/notifications with deduplication and caching. Zero dummy data.
 */
export function useNotifications(options = {}) {
  const { autoFetch = true } = options;
  const [notifications, setNotifications] = useState(sharedNotificationsList);
  const [unreadCount, setUnreadCount] = useState(sharedUnreadCount);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (force = false) => {
    const isCacheValid =
      sharedNotificationsList.length > 0 &&
      Date.now() - lastNotificationsFetchTimestamp < NOTIFICATIONS_CACHE_TTL_MS;
    if (!force && isCacheValid) {
      return { notifications: sharedNotificationsList, unreadCount: sharedUnreadCount };
    }

    if (inFlightNotificationsPromise) {
      return inFlightNotificationsPromise;
    }

    inFlightNotificationsPromise = (async () => {
      try {
        if (sharedNotificationsList.length === 0) {
          setLoading(true);
        }
        const res = await notificationService.getNotifications();
        const list = res?.notifications || res?.data || [];
        if (Array.isArray(list)) {
          sharedNotificationsList = list;
          sharedUnreadCount = list.filter((n) => !n.read && !n.isRead).length;
          lastNotificationsFetchTimestamp = Date.now();
          notifyNotificationListeners();
        }
        return { notifications: sharedNotificationsList, unreadCount: sharedUnreadCount };
      } catch (err) {
        console.warn("Could not fetch notifications from backend:", err.message);
        throw err;
      } finally {
        setLoading(false);
        inFlightNotificationsPromise = null;
      }
    })();

    return inFlightNotificationsPromise;
  }, []);

  useEffect(() => {
    const updateLocal = (state) => {
      setNotifications(state.notifications);
      setUnreadCount(state.unreadCount);
    };
    notificationListeners.add(updateLocal);

    if (autoFetch) {
      fetchNotifications();
    }

    return () => {
      notificationListeners.delete(updateLocal);
    };
  }, [autoFetch, fetchNotifications]);

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
