import React, { useMemo } from "react";
import { Flag, CheckCircle2, Clock, Zap, Calendar, Target } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";

/**
 * Feature Component: TimelineSummaryCards
 * Layer: features/timeline/components/
 * Responsibility: Displays live metrics and status KPIs for projects and tasks on the timeline.
 */
export const TimelineSummaryCards = ({ tasks = [], projects = [] }) => {
  const stats = useMemo(() => {
    // 1. Active Projects
    const activeProjectsCount = projects.filter((p) => {
      const st = (p.status || "").toUpperCase();
      return st === "ACTIVE" || st === "IN_PROGRESS" || st === "PLANNING";
    }).length;

    // 2. Completed deliverables
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter((t) => {
      const st = (t.status || "").toUpperCase();
      return st === "COMPLETED" || st === "DONE";
    }).length;
    const completionRate =
      totalTasksCount > 0
        ? Math.round((completedTasksCount / totalTasksCount) * 100)
        : 0;

    // 3. Upcoming Milestones / Deadlines in next 7 days
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingCount = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      const st = (t.status || "").toUpperCase();
      const notDone = st !== "COMPLETED" && st !== "DONE";
      return notDone && d >= now && d <= in7Days;
    }).length;

    // 4. In Progress / In Review tasks
    const inProgressCount = tasks.filter((t) => {
      const st = (t.status || "").toUpperCase();
      return st === "IN_PROGRESS" || st === "IN_REVIEW" || st === "REVIEW";
    }).length;

    return [
      {
        label: "Active Projects",
        value: String(activeProjectsCount).padStart(2, "0"),
        subtext: `${projects.length} total registered initiatives`,
        icon: Zap,
        color: "bg-indigo-50 text-primary",
      },
      {
        label: "Deliverables Completed",
        value: `${completedTasksCount} / ${totalTasksCount}`,
        subtext: `${completionRate}% total completion rate`,
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Due Next 7 Days",
        value: String(upcomingCount).padStart(2, "0"),
        subtext: upcomingCount > 0 ? "Upcoming milestone deadlines" : "No urgent deadlines this week",
        icon: Flag,
        color: "bg-purple-50 text-purple-600",
      },
      {
        label: "Tasks In Progress",
        value: String(inProgressCount).padStart(2, "0"),
        subtext: "Currently in active development",
        icon: Clock,
        color: "bg-cyan-50 text-cyan-600",
      },
    ];
  }, [tasks, projects]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Card key={s.label || s.title || idx} hover className="p-5 flex items-center gap-4">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {s.label}
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {s.value}
              </p>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {s.subtext}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TimelineSummaryCards;
