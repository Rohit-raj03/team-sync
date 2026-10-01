import React from "react";
import { TaskMetricCards } from "../../features/tasks/components/TaskMetricCards.jsx";
import { TaskActivityChart } from "../../features/tasks/components/TaskActivityChart.jsx";
import { TaskRecentList } from "../../features/tasks/components/TaskRecentList.jsx";
import { TodayScheduleWidget } from "../../features/dashboard/components/TodayScheduleWidget.jsx";
import { MessagesWidget } from "../../features/dashboard/components/MessagesWidget.jsx";

/**
 * Presentation Layer: DashboardPage (Screen 1 from Figma)
 * Layer: pages/dashboard/
 * Responsibility: Exact 1:1 reproduction of the Figma Dashboard layout combining KPI cards, Task Done spline chart, Task list, Today's Schedule, Messages, and New Task creator.
 */
export const DashboardPage = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-400 mx-auto">
      {/* Left / Center Main Section (approx 68% width on wide displays) */}
      <div className="xl:col-span-8 space-y-6">
        {/* 1. Top 3 KPI Cards */}
        <TaskMetricCards />

        {/* 2. "Task Done" Spline Area Chart */}
        <TaskActivityChart />

        {/* 3. "Task" Recent List Feed */}
        <TaskRecentList />
      </div>

      {/* Right Column / Sidebar Widgets (approx 32% width on wide displays) */}
      <div className="xl:col-span-4 space-y-8 pl-0 xl:pl-2">
        {/* 1. Today's Scheudle Widget with Discovery Call Card */}
        <TodayScheduleWidget />

        {/* 2. Messages Widget with 4 User Threads */}
        <MessagesWidget />
      </div>
    </div>
  );
};

export default DashboardPage;
