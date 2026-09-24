import { useState } from 'react';

const mockNotifications = [
  { id: '1', message: 'Alex assigned you to Configure Tailwind CSS', time: '10m ago', unread: true },
  { id: '2', message: 'Sarah updated project Mobile Client v2', time: '2h ago', unread: false },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return { notifications, markAllAsRead };
}
