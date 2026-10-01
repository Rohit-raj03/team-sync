import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Paperclip,
  ListChecks,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import {
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
} from "../utils/taskHelpers.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

/**
 * Feature Component: TaskCard
 * Layer: features/tasks/components/
 * Responsibility: Displays single task summary with status, priority, assignee avatars, subtask counters, and tags.
 */
export const TaskCard = ({ task, onClick }) => {
  const completedSubtasks =
    task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      onClick={onClick}
      className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={getPriorityBadgeVariant(task.priority)}>
            {task.priority}
          </Badge>
          <Badge variant={getStatusBadgeVariant(task.status)}>
            {task.status?.replace("_", " ") || "TO DO"}
          </Badge>
        </div>

        <h4 className="font-semibold text-slate-800 group-hover:text-[#4361EE] transition-colors line-clamp-1">
          {task.title}
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
          {task.description || "No description provided."}
        </p>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar size={13} />
            <span>{formatDate(task.dueDate)}</span>
          </div>

          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-slate-500">
              <ListChecks size={13} />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1 text-slate-500">
              <Paperclip size={13} />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignees Avatars or text */}
        <div className="flex items-center">
          {task.assignees && task.assignees.length > 0 ? (
            <div className="flex -space-x-1.5 overflow-hidden">
              {task.assignees.slice(0, 3).map((u) => (
                <img
                  key={u.id}
                  src={u.avatar}
                  alt={u.name}
                  title={`${u.name} (${u.role || "Member"})`}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`;
                  }}
                />
              ))}
              {task.assignees.length > 3 && (
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                  +{task.assignees.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="font-medium text-slate-600 truncate max-w-25">
              {task.assignedTo || "Unassigned"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
