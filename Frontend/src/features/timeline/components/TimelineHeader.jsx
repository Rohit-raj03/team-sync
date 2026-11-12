import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button.jsx";

/**
 * Feature Component: TimelineHeader
 * Layer: features/timeline/components/
 * Responsibility: Header controls for the Timeline page including date navigation,
 * view mode switches, multi-parameter filtering (project, status, priority, search),
 * and action CTA to add milestone/task.
 */
export const TimelineHeader = ({
  rangeTitle = "Timeline",
  viewMode = "Day",
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  projects = [],
  filters = { project: "ALL", status: "ALL", priority: "ALL", search: "" },
  onFilterChange,
  onResetFilters,
  onAddTask,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const modes = ["Day", "Week", "Month", "Quarter"];

  const hasActiveFilters =
    filters.project !== "ALL" ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    Boolean(filters.search);

  return (
    <div className="space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Date Range Navigation */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Timeline & Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Project roadmap, deliverable tracks, and Gantt milestone schedule
            </p>
          </div>

          {/* Date Range Navigator */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={onPrev}
              title="Previous period"
              className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-bold text-slate-700 px-2.5 flex items-center gap-1.5 min-w-32 justify-center">
              <Calendar size={13} className="text-primary" />
              {rangeTitle}
            </span>

            <button
              onClick={onNext}
              title="Next period"
              className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronRight size={16} />
            </button>

            <button
              onClick={onToday}
              className="text-[11px] font-bold text-primary hover:bg-indigo-50 px-2 py-1 rounded-xl transition-colors ml-0.5"
            >
              Today
            </button>
          </div>
        </div>

        {/* Right: Scale switcher, Filter toggle & CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Scale Switcher Pills */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-full border border-slate-200/80 shadow-2xs">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange?.(mode)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === mode
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`p-2.5 bg-white border rounded-2xl transition-all relative shadow-2xs ${
              showFilters || hasActiveFilters
                ? "border-indigo-300 text-primary bg-indigo-50/40"
                : "border-slate-200/80 text-slate-600 hover:bg-slate-50"
            }`}
            title="Toggle filters"
          >
            <Filter size={16} />
            {hasActiveFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          {/* Add Milestone / Task CTA */}
          <Button
            onClick={onAddTask}
            className="rounded-full bg-linear-to-r from-primary to-blue-600 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={15} />
            <span>Add Milestone</span>
          </Button>
        </div>
      </div>

      {/* Expandable Filter Controls Bar */}
      {showFilters && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-44">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange?.("search", e.target.value)}
                placeholder="Search tasks by name or tag..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filter by Project */}
            <div className="min-w-36">
              <select
                value={filters.project}
                onChange={(e) => onFilterChange?.("project", e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="min-w-32">
              <select
                value={filters.status}
                onChange={(e) => onFilterChange?.("status", e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Filter by Priority */}
            <div className="min-w-30">
              <select
                value={filters.priority}
                onChange={(e) => onFilterChange?.("priority", e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineHeader;
