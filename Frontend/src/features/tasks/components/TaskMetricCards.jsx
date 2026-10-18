import React from "react";
import { Star, FileText, ClipboardCheck } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { useTasks } from "../hooks/useTasks.js";
import { useProjects } from "../../projects/hooks/useProjects.js";

/**
 * Feature Component: TaskMetricCards
 * Computes live KPI summary metrics from backend tasks and projects.
 * Zero dummy data.
 */
export const TaskMetricCards = () => {
  const { tasks = [] } = useTasks();
  const { allProjects = [] } = useProjects();

  const completedTasksCount = tasks.filter(
    (t) => t.status === "COMPLETED" || t.status === "Done"
  ).length;

  const inProgressTasksCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "In Progress" || t.status === "TODO"
  ).length;

  const completedProjectsCount = allProjects.filter(
    (p) => p.status === "COMPLETED" || p.status === "Done"
  ).length;

  const metrics = [
    {
      id: "task-completed",
      title: "Task Completed",
      value: String(completedTasksCount).padStart(2, "0"),
      growth: `${completedTasksCount} of ${tasks.length}`,
      subtext: "completed",
      icon: Star,
      strokeColor: "#7064F6",
      fillColor: "rgba(112, 100, 246, 0.08)",
      sparklinePoints:
        "M 0 35 C 15 32, 25 36, 40 22 C 55 10, 65 30, 80 18 C 95 6, 110 22, 130 12 L 130 45 L 0 45 Z",
      sparklineLine:
        "M 0 35 C 15 32, 25 36, 40 22 C 55 10, 65 30, 80 18 C 95 6, 110 22, 130 12",
    },
    {
      id: "new-task",
      title: "Active Tasks",
      value: String(inProgressTasksCount).padStart(2, "0"),
      growth: `${inProgressTasksCount} pending`,
      subtext: "in progress",
      icon: FileText,
      strokeColor: "#00C2FF",
      fillColor: "rgba(0, 194, 255, 0.08)",
      sparklinePoints:
        "M 0 30 C 15 32, 30 18, 45 28 C 60 36, 75 12, 90 20 C 105 28, 115 14, 130 8 L 130 45 L 0 45 Z",
      sparklineLine:
        "M 0 30 C 15 32, 30 18, 45 28 C 60 36, 75 12, 90 20 C 105 28, 115 14, 130 8",
    },
    {
      id: "project-done",
      title: "Projects",
      value: String(allProjects.length).padStart(2, "0"),
      growth: `${completedProjectsCount} completed`,
      subtext: "total active",
      icon: ClipboardCheck,
      strokeColor: "#FF7675",
      fillColor: "rgba(255, 118, 117, 0.08)",
      sparklinePoints:
        "M 0 32 C 15 30, 30 35, 45 22 C 60 10, 75 28, 90 14 C 105 4, 120 18, 130 10 L 130 45 L 0 45 Z",
      sparklineLine:
        "M 0 32 C 15 30, 30 35, 45 22 C 60 10, 75 28, 90 14 C 105 4, 120 18, 130 10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card
            key={m.id}
            className="p-6 rounded-3xl flex flex-col justify-between"
          >
            {/* Top row: Icon + Title on left, Big number on right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-400">
                  <Icon size={16} strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-slate-500">
                  {m.title}
                </span>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {m.value}
              </span>
            </div>

            {/* Bottom row: Sparkline curve on left, Growth text on right */}
            <div className="flex items-end justify-between mt-6">
              {/* Sparkline curve */}
              <div className="w-32 h-11">
                <svg
                  viewBox="0 0 130 45"
                  className="w-full h-full overflow-visible"
                >
                  <path d={m.sparklinePoints} fill={m.fillColor} />
                  <path
                    d={m.sparklineLine}
                    fill="none"
                    stroke={m.strokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Text on right */}
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">
                  {m.growth}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {m.subtext}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
