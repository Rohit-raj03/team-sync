import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Paperclip,
  ListChecks,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getPriorityBadgeVariant(task.priority)}>
              {task.priority}
            </Badge>
            {task.isIndividual ||
            (!task.project && !task.projectId) ||
            task.projectName === "Individual Task" ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                Self / Individual
              </span>
            ) : (
              task.projectName && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 max-w-32.5 truncate"
                  title={task.projectName}
                >
                  {task.projectName}
                </span>
              )
            )}
          </div>
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
                <Avatar
                  key={u.id || u._id}
                  src={u.avatar}
                  name={u.name}
                  size="xs"
                  className="ring-2 ring-white"
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
