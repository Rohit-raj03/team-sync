import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  ListTodo,
  Tag,
  Paperclip,
  Check,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { formatDate } from "../../../shared/utils/formatDate.js";
import {
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
} from "../../tasks/utils/taskHelpers.js";

/**
 * Feature Component: ProjectTaskList
 * Layer: features/projects/components/
 * Responsibility: Displays connected tasks for a specific project with status filters and quick task creation trigger.
 */
export const ProjectTaskList = ({
  tasks = [],
  projectName = "",
  onTaskClick,
  onAddTask,
}) => {
  const [filter, setFilter] = useState("ALL");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center">
            <ListTodo size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Connected Tasks ({tasks.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Work items and deliverables assigned to {projectName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-semibold">
            {["ALL", "TODO", "IN_PROGRESS", "COMPLETED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filter === status
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status === "ALL"
                  ? "All"
                  : status === "TODO"
                    ? "To Do"
                    : status === "IN_PROGRESS"
                      ? "In Progress"
                      : "Completed"}
              </button>
            ))}
          </div>

          {onAddTask && (
            <button
              onClick={onAddTask}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl bg-white overflow-hidden shadow-xs">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(task.status)}>
                    {task.status?.replace("_", " ")}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#4361EE] transition-colors truncate">
                    {task.title}
                  </h4>
                </div>
                {task.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Meta Right Side: Dates, Assignees, Subtasks */}
              <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}

                {task.assignees && task.assignees.length > 0 ? (
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {task.assignees.slice(0, 3).map((u) => (
                      <img
                        key={u.id}
                        src={u.avatar}
                        alt={u.name}
                        title={u.name}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`;
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-slate-600">
                    {task.assignedTo || "Unassigned"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
          <p className="text-xs font-medium text-slate-500">
            No tasks found in this project matching the selected filter.
          </p>
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4361EE] hover:underline"
            >
              <Plus size={13} />
              <span>Create the first task for this project</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
