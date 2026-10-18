import React from "react";
import { MessageSquare, Bell, User } from "lucide-react";
import { useNotifications } from "../../notifications/hooks/useNotifications.js";
import { useTeam } from "../../team/hooks/useTeam.js";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";

/**
 * Feature Component: MessagesWidget
 * Connects to live backend notifications and registered team activity.
 * Zero dummy data.
 */
export const MessagesWidget = () => {
  const { notifications = [] } = useNotifications();
  const { members = [] } = useTeam();

  // If notifications exist, display them; otherwise display active registered teammates
  const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {hasNotifications ? "Recent Notifications" : "Team Members"}
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          {hasNotifications ? `${notifications.length} alerts` : `${members.length} members`}
        </span>
      </div>

      <div className="space-y-2.5">
        {hasNotifications ? (
          notifications.slice(0, 4).map((n) => (
            <div
              key={n._id || n.id}
              className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-white bg-slate-50/70 border border-slate-100/80 transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-[#4361EE] flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#4361EE] transition-colors truncate">
                  {n.title || (n.sender?.name ? `From ${n.sender.name}` : "Notification")}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        ) : members.length > 0 ? (
          members.slice(0, 4).map((m) => (
            <div
              key={m.id || m._id}
              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition-all cursor-pointer group"
            >
              <Avatar
                src={m.avatar}
                name={m.name}
                size="sm"
                className="ring-2 ring-indigo-50"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#4361EE] transition-colors truncate">
                  {m.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                  {m.email || m.role}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No messages or team activity yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesWidget;
