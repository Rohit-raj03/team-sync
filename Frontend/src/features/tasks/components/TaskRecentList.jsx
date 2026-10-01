import React from "react";
import { Play, Clock, Link2, MessageSquare, Bell } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";

/**
 * Feature Component: TaskRecentList
 * Layer: features/tasks/components/
 * Responsibility: Exact reproduction of the Task list items with play buttons, progress meters, and reminder triggers matching Figma.
 */
export const TaskRecentList = () => {
  const tasks = [
    {
      id: "1",
      startTime: "9.00 am",
      title: "Search Inspiration for project",
      url: "www.uistore.com",
      comments: 8,
      progress: 24,
      progressBarColor: "bg-[#00C2FF]",
    },
    {
      id: "2",
      startTime: "3.00 am",
      title: "Search Inspiration for project",
      url: "www.uistore.org",
      comments: 5,
      progress: 60,
      progressBarColor: "bg-[#7064F6]",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Task</h3>

      <div className="space-y-3.5">
        {tasks.map((t) => (
          <Card key={t.id} className="p-5 md:p-6 rounded-3xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              {/* 1. Play Button & Start Time */}
              <div className="flex items-center gap-4 min-w-44">
                <button
                  className="w-11 h-11 rounded-full bg-[#4361EE] text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-300 hover:scale-105 transition-transform"
                  aria-label="Play task"
                >
                  <Play size={16} fill="white" className="ml-0.5" />
                </button>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Start from
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                    <Clock size={13} />
                    <span>{t.startTime}</span>
                  </div>
                </div>
              </div>

              {/* 2. Task Title & Links */}
              <div className="flex-1 min-w-64">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {t.title}
                </h4>
                <div className="flex items-center gap-4 text-xs mt-1.5">
                  <a
                    href={`https://${t.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#4361EE] font-medium hover:underline"
                  >
                    <Link2 size={13} />
                    <span>{t.url}</span>
                  </a>
                  <div className="flex items-center gap-1 text-slate-400 font-medium">
                    <MessageSquare size={13} />
                    <span>{t.comments} comments</span>
                  </div>
                </div>
              </div>

              {/* 3. Progress Meter */}
              <div className="min-w-44">
                <span className="text-xs font-bold text-slate-800 block mb-1.5">
                  {t.progress}% complete
                </span>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${t.progressBarColor} h-1.5 rounded-full`}
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              </div>

              {/* 4. Reminder Button */}
              <div className="shrink-0">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F0EFFE] hover:bg-[#E8E6FD] text-[#7064F6] text-xs font-bold transition-colors">
                  <Bell size={14} className="text-[#7064F6]" />
                  <span>Reminder</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskRecentList;
