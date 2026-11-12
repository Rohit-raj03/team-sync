import React, { useState } from "react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { useTasks } from "../hooks/useTasks.js";

/**
 * Feature Component: TaskActivityChart
 * Layer: features/tasks/components/
 * Responsibility: Exact reproduction of "Task Done" dual-spline area chart from Figma with cyan/purple curves and month ticks.
 * Integrates live task completion metrics from useTasks.
 */
export const TaskActivityChart = () => {
  const [activeTab, setActiveTab] = useState("Monthly");
  const { allTasks = [] } = useTasks();

  const completedCount = allTasks.filter(
    (t) => t.status === "COMPLETED" || t.status === "Done"
  ).length;

  const tabs = ["Daily", "Weekly", "Monthly"];
  const months = [
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
  ];

  // Purple nodes
  const purplePoints = [
    { cx: 50, cy: 220 },
    { cx: 105, cy: 190 },
    { cx: 160, cy: 155 },
    { cx: 215, cy: 50 }, // Aug peak
    { cx: 270, cy: 125 },
    { cx: 325, cy: 145 },
    { cx: 380, cy: 120 },
    { cx: 435, cy: 165 },
    { cx: 490, cy: 100 },
    { cx: 545, cy: 65 }, // Feb peak
    { cx: 600, cy: 110 },
    { cx: 645, cy: 175 },
  ];

  // Cyan nodes
  const cyanPoints = [
    { cx: 50, cy: 235 },
    { cx: 105, cy: 175 },
    { cx: 160, cy: 160 },
    { cx: 215, cy: 80 }, // Aug peak
    { cx: 270, cy: 145 },
    { cx: 325, cy: 140 },
    { cx: 380, cy: 205 },
    { cx: 435, cy: 230 },
    { cx: 490, cy: 215 },
    { cx: 545, cy: 200 },
    { cx: 600, cy: 165 },
    { cx: 645, cy: 170 },
  ];

  return (
    <Card className="p-6 md:p-8 rounded-3xl">
      {/* Header: Task Done on left, Daily Weekly Monthly on right */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Task Done
          </h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            {completedCount} Completed
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-semibold">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition-all pb-1 focus:outline-none cursor-pointer ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas with Y-axis guides */}
      <div className="relative w-full h-64 md:h-72">
        {/* Y-Axis scale numbers & Grid lines */}
        <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-[11px] font-medium text-slate-500 select-none">
          <span>400</span>
          <span>300</span>
          <span>200</span>
          <span>100</span>
          <span className="text-right">0</span>
        </div>

        {/* SVG Drawing Area */}
        <div className="ml-10 h-full flex flex-col justify-between">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 680 250"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Purple Spline Gradient */}
                <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7064F6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#7064F6" stopOpacity="0.0" />
                </linearGradient>

                {/* Cyan Spline Gradient */}
                <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="10" x2="680" y2="10" stroke="#F1F5F9" />
              <line x1="0" y1="70" x2="680" y2="70" stroke="#F1F5F9" />
              <line x1="0" y1="130" x2="680" y2="130" stroke="#F1F5F9" />
              <line x1="0" y1="190" x2="680" y2="190" stroke="#F1F5F9" />
              <line x1="0" y1="248" x2="680" y2="248" stroke="#F1F5F9" />

              {/* Cyan Area & Stroke */}
              <path
                d="M 20 235 C 70 200, 110 165, 160 160 C 185 155, 200 80, 220 80 C 240 80, 260 130, 280 145 C 310 160, 340 120, 370 190 C 400 230, 440 235, 470 220 C 510 200, 560 195, 600 165 C 625 150, 645 170, 675 168 L 675 250 L 20 250 Z"
                fill="url(#cyanArea)"
              />
              <path
                d="M 20 235 C 70 200, 110 165, 160 160 C 185 155, 200 80, 220 80 C 240 80, 260 130, 280 145 C 310 160, 340 120, 370 190 C 400 230, 440 235, 470 220 C 510 200, 560 195, 600 165 C 625 150, 645 170, 675 168"
                fill="none"
                stroke="#00C2FF"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Cyan Data Point Markers */}
              {cyanPoints.map((pt, idx) => (
                <circle
                  key={`c-${idx}`}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="3.5"
                  fill="#00C2FF"
                  className="ring-2 ring-white"
                />
              ))}

              {/* Purple Area & Stroke */}
              <path
                d="M 20 225 C 60 210, 110 185, 155 150 C 185 125, 200 50, 220 50 C 245 50, 265 110, 290 128 C 320 150, 345 130, 375 120 C 405 110, 440 180, 470 140 C 510 90, 530 65, 560 65 C 590 65, 615 130, 645 155 C 660 170, 670 180, 675 180 L 675 250 L 20 250 Z"
                fill="url(#purpleArea)"
              />
              <path
                d="M 20 225 C 60 210, 110 185, 155 150 C 185 125, 200 50, 220 50 C 245 50, 265 110, 290 128 C 320 150, 345 130, 375 120 C 405 110, 440 180, 470 140 C 510 90, 530 65, 560 65 C 590 65, 615 130, 645 155 C 660 170, 670 180, 675 180"
                fill="none"
                stroke="#7064F6"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Purple Data Point Markers */}
              {purplePoints.map((pt, idx) => (
                <circle
                  key={`p-${idx}`}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="3.5"
                  fill="#7064F6"
                  className="ring-2 ring-white"
                />
              ))}
            </svg>
          </div>

          {/* X-Axis Month Ticks */}
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 pt-2 px-1">
            {months.map((m, idx) => (
              <span key={idx}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskActivityChart;
