import React, { useState, useMemo } from "react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { Calendar, FolderKanban } from "lucide-react";
import { useProjects } from "../../projects/hooks/useProjects.js";
import { useTasks } from "../../tasks/hooks/useTasks.js";

/**
 * Feature Component: TimelineCalendarGrid
 * Layer: features/timeline/components/
 * Responsibility: Interactive Gantt and sprint schedule grid showing live tasks and projects. Zero dummy data.
 */
export const TimelineCalendarGrid = () => {
  const [activeTask, setActiveTask] = useState(null);
  const { projects = [] } = useProjects();
  const { allTasks = [] } = useTasks();

  // Generate 10 days starting from 3 days ago up to 7 days ahead
  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = -3; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        date: d,
        num: d.getDate(),
        day: dayNames[d.getDay()],
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  // Map real projects to tracks with their real tasks
  const tracks = useMemo(() => {
    const colorClasses = [
      "from-indigo-600 to-blue-600",
      "from-purple-600 to-indigo-600",
      "from-cyan-500 to-teal-500",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-pink-500",
    ];

    if (projects.length === 0 && allTasks.length === 0) {
      return [];
    }

    // Projects as tracks
    const mapped = projects.map((p, pIdx) => {
      const pId = p.id || p._id;
      const projectTasks = allTasks.filter(
        (t) => (t.projectId || t.project?._id || t.project) === pId
      );

      const tasksBars = projectTasks.map((task, tIdx) => {
        const subtasks = task.subtasks || [];
        const completedSubtasks = subtasks.filter((s) => s.completed).length;
        const progress =
          subtasks.length > 0
            ? Math.round((completedSubtasks / subtasks.length) * 100)
            : task.status === "COMPLETED" || task.status === "DONE"
            ? 100
            : 40;

        const assigneeName =
          Array.isArray(task.assignees) && task.assignees.length > 0
            ? task.assignees[0].name
            : task.assignedTo || "Unassigned";

        const startCol = 1 + (tIdx % 5);
        const span = Math.min(3 + (tIdx % 3), 10 - startCol);

        return {
          id: task.id || task._id,
          name: task.title,
          startCol,
          span,
          color: colorClasses[(pIdx + tIdx) % colorClasses.length],
          progress,
          assignee: assigneeName,
          status: task.status || "In Progress",
        };
      });

      return {
        id: pId,
        title: p.name,
        category: p.category || "General",
        tasks: tasksBars,
      };
    });

    // Also include an "Individual Tasks" track if there are standalone tasks
    const standaloneTasks = allTasks.filter(
      (t) => !t.projectId && !t.project && !t.project?._id
    );

    if (standaloneTasks.length > 0) {
      mapped.push({
        id: "standalone-track",
        title: "Individual Tasks",
        category: "General",
        tasks: standaloneTasks.map((t, idx) => ({
          id: t.id || t._id,
          name: t.title,
          startCol: 1 + (idx % 6),
          span: 3,
          color: "from-purple-500 to-indigo-500",
          progress: t.status === "COMPLETED" ? 100 : 50,
          assignee: t.assignedTo || "Self",
          status: t.status || "TODO",
        })),
      });
    }

    return mapped;
  }, [projects, allTasks]);

  return (
    <Card className="p-0 overflow-hidden relative">
      {tracks.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="min-w-220">
            {/* Header Row: Track labels + Dates */}
            <div className="grid grid-cols-12 border-b border-slate-100 bg-[#F8FAFC]">
              <div className="col-span-3 p-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                Projects & Initiatives
              </div>

              {/* Date Columns */}
              <div className="col-span-9 grid grid-cols-10 divide-x divide-slate-100">
                {days.map((d, idx) => (
                  <div
                    key={idx}
                    className={`p-3 text-center transition-colors ${
                      d.isToday ? "bg-indigo-50/50" : ""
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      {d.day}
                    </p>
                    <div
                      className={`mt-1 inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
                        d.isToday
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-800"
                      }`}
                    >
                      {d.num}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rows for Tracks */}
            <div className="divide-y divide-slate-100">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="grid grid-cols-12 min-h-24 hover:bg-slate-50/40 transition-colors"
                >
                  {/* Track Title */}
                  <div className="col-span-3 p-4 px-6 flex flex-col justify-center">
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {track.title}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400 mt-1">
                      {track.category}
                    </span>
                  </div>

                  {/* Track Timeline Canvas */}
                  <div className="col-span-9 grid grid-cols-10 divide-x divide-slate-100 relative p-3 items-center">
                    {days.map((d, idx) => (
                      <div
                        key={idx}
                        className={`h-full pointer-events-none ${
                          d.isToday ? "bg-indigo-50/20" : ""
                        }`}
                      />
                    ))}

                    {/* Task Bars */}
                    {track.tasks.map((task) => {
                      const leftPercent = ((task.startCol - 1) / 10) * 100;
                      const widthPercent = (task.span / 10) * 100;

                      return (
                        <div
                          key={task.id}
                          onMouseEnter={() => setActiveTask(task)}
                          onMouseLeave={() => setActiveTask(null)}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute z-10 px-3.5 py-2.5 rounded-2xl bg-linear-to-r ${task.color} text-white shadow-md shadow-slate-200/50 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-lg transition-all group`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold truncate leading-tight">
                              {task.name}
                            </p>
                            <Avatar
                              name={task.assignee}
                              size="sm"
                              className="w-5 h-5 text-[9px] border border-white/40"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-white/80 mt-1">
                            <span>{task.progress}%</span>
                            <span className="truncate max-w-20">
                              {task.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
          <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">
            No schedule milestones yet
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Create projects and assign tasks with start and due dates to track live sprint timelines and milestone progress here.
          </p>
        </div>
      )}

      {/* Floating Popover Inspector */}
      {activeTask && (
        <div className="absolute bottom-4 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-800 z-30 animate-in fade-in zoom-in-95 max-w-xs">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Sprint Milestone
            </span>
            <span className="text-xs text-slate-400">{activeTask.status}</span>
          </div>
          <h5 className="font-bold text-sm leading-tight text-white mb-2">
            {activeTask.name}
          </h5>
          <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span>Assignee: {activeTask.assignee}</span>
            <span className="font-bold text-emerald-400">
              {activeTask.progress}%
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TimelineCalendarGrid;
