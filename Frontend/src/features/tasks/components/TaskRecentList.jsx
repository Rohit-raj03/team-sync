import React from "react";
import { Play, Clock, FolderKanban, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { useTasks } from "../hooks/useTasks.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

/**
 * Feature Component: TaskRecentList
 * Displays live backend tasks directly on the dashboard feed.
 * Zero dummy data.
 */
export const TaskRecentList = () => {
  const { tasks = [], loading } = useTasks();

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Tasks</h3>
        <span className="text-xs font-semibold text-slate-400">
          {tasks.length} Total
        </span>
      </div>

      <div className="space-y-3.5">
        {loading && tasks.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-400 rounded-3xl">
            Loading tasks from server...
          </Card>
        ) : recentTasks.length > 0 ? (
          recentTasks.map((t) => {
            const taskId = t.id || t._id;
            const progress =
              t.progress !== undefined
                ? t.progress
                : t.status === "COMPLETED" || t.status === "Done"
                ? 100
                : t.subtasks && t.subtasks.length > 0
                ? Math.round(
                    (t.subtasks.filter((s) => s.completed).length /
                      t.subtasks.length) *
                      100
                  )
                : 0;

            const isDone = t.status === "COMPLETED" || t.status === "Done";
            const progressBarColor = isDone
              ? "bg-emerald-500"
              : progress > 50
              ? "bg-[#7064F6]"
              : "bg-[#00C2FF]";

            return (
              <Card key={taskId} className="p-5 md:p-6 rounded-3xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* 1. Play Button & Schedule */}
                  <div className="flex items-center gap-4 min-w-44">
                    <div
                      className={`w-11 h-11 rounded-full text-white flex items-center justify-center shrink-0 shadow-md ${
                        isDone
                          ? "bg-emerald-500 shadow-emerald-200"
                          : "bg-primary shadow-indigo-300"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Play size={16} fill="white" className="ml-0.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {isDone ? "Completed" : "In Progress"}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                        <Clock size={13} />
                        <span>
                          {t.dueDate ? formatDate(t.dueDate) : t.startDate ? formatDate(t.startDate) : "No date"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Task Title & Project */}
                  <div className="flex-1 min-w-64">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {t.title}
                      </h4>
                      {t.priority && (
                        <Badge
                          variant={
                            t.priority === "URGENT" || t.priority === "HIGH"
                              ? "danger"
                              : "default"
                          }
                        >
                          {t.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-1.5">
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <FolderKanban size={13} />
                        <span>
                          {t.projectName || (typeof t.project === "object" ? t.project?.name : "Workspace")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <MessageSquare size={13} />
                        <span>
                          {Array.isArray(t.subtasks)
                            ? `${t.subtasks.filter((s) => s.completed).length}/${t.subtasks.length} subtasks`
                            : "0 subtasks"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Progress Meter */}
                  <div className="min-w-44">
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">
                      {progress}% complete
                    </span>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${progressBarColor} h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 4. Assignees Avatars */}
                  <div className="shrink-0 flex items-center">
                    {Array.isArray(t.assignees) && t.assignees.length > 0 ? (
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {t.assignees.slice(0, 3).map((a, i) => (
                          <Avatar
                            key={a.id || a._id || a.email || `assignee-${a.name || i}`}
                            src={a.avatar}
                            name={a.name || "User"}
                            size="xs"
                            className="ring-2 ring-white"
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200">
            <p className="font-medium text-slate-500">No active tasks found in your workspace.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Create a task inside any project to see it tracked here live.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskRecentList;
