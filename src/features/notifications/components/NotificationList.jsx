import React from 'react';
import { useNotifications } from '../hooks/useNotifications.js';

export const NotificationList = () => {
  const { notifications, markAllAsRead } = useNotifications();

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="font-semibold text-sm text-slate-800">Notifications</span>
        <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:underline">
          Mark all read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-3 rounded-xl text-xs flex items-center justify-between ${
              n.unread ? 'bg-indigo-50/60 font-medium text-slate-800' : 'text-slate-500'
            }`}
          >
            <span>{n.message}</span>
            <span className="text-slate-400 pl-2">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
