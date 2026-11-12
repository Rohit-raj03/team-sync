import React from "react";
import { MessageSquare, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../notifications/hooks/useNotifications.js";
import { useTeam } from "../../team/hooks/useTeam.js";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { ROUTES } from "../../../shared/constants/routes.js";

/**
 * Feature Component: MessagesWidget
 * Displays real-time team updates, notifications, and active team collaborators with direct navigation.
 * Zero dummy data.
 */
export const MessagesWidget = () => {
  const navigate = useNavigate();
  const { notifications = [] } = useNotifications();
  const { members = [] } = useTeam();

  const hasNotifications = notifications.length > 0;

  return (
    <div className="space-y-3">
      {/* Widget Header with Semantic Labelling & Direct Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 text-primary">
            {hasNotifications ? (
              <Bell size={16} />
            ) : (
              <MessageSquare size={16} />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {hasNotifications ? "Team Alerts" : "Team Members"}
          </h3>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(hasNotifications ? ROUTES.MESSAGES : ROUTES.TEAM)
          }
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          {hasNotifications
            ? `${notifications.length} alerts →`
            : `${members.length} members →`}
        </button>
      </div>

      <div className="space-y-2.5">
        {hasNotifications ? (
          notifications.slice(0, 4).map((n) => (
            <div
              key={n._id || n.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(ROUTES.MESSAGES)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(ROUTES.MESSAGES);
                }
              }}
              className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-white bg-slate-50/70 border border-slate-100/80 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">
                  {n.title ||
                    (n.sender?.name
                      ? `From ${n.sender.name}`
                      : "Notification")}
                </h4>
                <p className="text-[11px] font-medium text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        ) : members.length > 0 ? (
          members.slice(0, 4).map((m) => (
            <div
              key={m.id || m._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(ROUTES.TEAM)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(ROUTES.TEAM);
                }
              }}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white bg-slate-50/70 border border-slate-100/80 transition-all cursor-pointer group shadow-2xs"
            >
              <Avatar
                src={m.avatar}
                name={m.name}
                size="sm"
                className="ring-2 ring-indigo-50"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">
                  {m.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                  {m.email || m.role}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No team alerts or activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesWidget;
