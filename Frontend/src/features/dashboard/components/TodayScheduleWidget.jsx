import React from "react";
import { Calendar, Clock, CheckCircle2, FolderKanban } from "lucide-react";
import { useTasks } from "../../tasks/hooks/useTasks.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

/**
 * Feature Component: TodayScheduleWidget
 * Displays upcoming task milestones and deadlines from live backend tasks.
 * Zero dummy data.
 */
export const TodayScheduleWidget = () => {
  const { tasks = [] } = useTasks();

  // Find nearest upcoming task with a due date
  const upcomingTask = tasks.find(
    (t) => (t.status !== "COMPLETED" && t.status !== "Done") && t.dueDate
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Today's Schedule
        </h3>
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-100 shadow-2xs text-slate-400">
          <div className="p-1 rounded-lg text-slate-700">
            <Calendar size={15} />
          </div>
        </div>
      </div>

      {upcomingTask ? (
        <>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#00C2FF] truncate max-w-[200px]">
              {upcomingTask.projectName || "Upcoming Milestone"}
            </span>
            <span className="text-slate-400 text-[11px]">
              Due {formatDate(upcomingTask.dueDate)}
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-900 truncate">
            {upcomingTask.title}
          </h4>

          {/* Blue Call/Milestone Card */}
          <div className="p-4 rounded-3xl bg-[#4361EE] text-white flex items-center justify-between shadow-md shadow-indigo-200">
            {/* Avatar Stack of Assignees */}
            <div className="flex items-center -space-x-2">
              {Array.isArray(upcomingTask.assignees) && upcomingTask.assignees.length > 0 ? (
                upcomingTask.assignees.slice(0, 3).map((a, i) => (
                  <img
                    key={a.id || a._id || i}
                    src={
                      a.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        a.name || "User"
                      )}`
                    }
                    alt={a.name}
                    title={a.name}
                    className="w-8 h-8 rounded-full border-2 border-[#4361EE] object-cover"
                  />
                ))
              ) : (
                <div className="w-8 h-8 rounded-full bg-white text-[#4361EE] font-bold text-xs flex items-center justify-center border-2 border-[#4361EE]">
                  TS
                </div>
              )}
            </div>

            {/* Task Priority & Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-2.5 py-1 rounded-full">
                {upcomingTask.priority || "Normal"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="p-5 rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">No deadlines scheduled</p>
          <p className="text-[11px] text-slate-400">
            Tasks with due dates will automatically appear here on your schedule.
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayScheduleWidget;
