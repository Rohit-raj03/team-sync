import React, { useState, useMemo, useRef } from "react";
import {
  Calendar,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { TimelineTaskBar } from "./TimelineTaskBar.jsx";
import { TimelineTaskHoverCard } from "./TimelineTaskHoverCard.jsx";
import {
  deriveProjectColorTokens,
  DEFAULT_PROJECT_COLOR,
  STANDALONE_TASK_COLOR,
} from "../utils/timelineColors.js";
import {
  generateTimelineRange,
  packTasksIntoSubRows,
} from "../utils/timelineDateUtils.js";

/**
 * Feature Component: TimelineCalendarGrid
 * Layer: features/timeline/components/
 * Responsibility: Premium, professional Gantt timeline with project-inherited color tokens,
 * vertical grid alignment, live Today line, non-overlapping task packing, floating hover overview,
 * and direct task detail modal interaction.
 */
export const TimelineCalendarGrid = ({
  tasks = [],
  projects = [],
  loading = false,
  error = null,
  viewMode = "Day",
  anchorDate = new Date(),
  onTaskClick,
  onAddTask,
}) => {
  // Collapsed project tracks state
  const [collapsedTracks, setCollapsedTracks] = useState({});

  // Floating hover card state
  const [hoveredData, setHoveredData] = useState(null); // { task, colorTokens, projectName, anchorRect }
  const hoverTimeoutRef = useRef(null);

  // Generate date intervals and bounds
  const { intervals, timelineStart, timelineEnd, todayPositionPercent } =
    useMemo(() => {
      return generateTimelineRange(anchorDate, viewMode);
    }, [anchorDate, viewMode]);

  // Group tasks by project track
  const tracks = useMemo(() => {
    const result = [];

    // 1. Tracks for existing projects
    projects.forEach((proj) => {
      const pId = proj.id || proj._id;
      const projTheme = proj.themeColor || proj.color || DEFAULT_PROJECT_COLOR;
      const colorTokens = deriveProjectColorTokens(projTheme);

      // Filter tasks belonging to this project
      const projTasks = tasks.filter((t) => {
        const tPId =
          t.projectId ||
          (typeof t.project === "string" ? t.project : null) ||
          t.project?._id ||
          t.project?.id;
        return tPId && (tPId === pId || String(tPId) === String(pId));
      });

      // Pack tasks into non-overlapping sub-rows
      const { subRows, subRowCount } = packTasksIntoSubRows(
        projTasks,
        timelineStart,
        timelineEnd,
      );

      result.push({
        id: pId,
        title: proj.name,
        category: proj.category || "General",
        key: proj.key || proj.name.substring(0, 3).toUpperCase(),
        themeColor: projTheme,
        colorTokens,
        subRows,
        subRowCount,
        taskCount: projTasks.length,
        isIndividual: false,
      });
    });

    // 2. Standalone / Individual tasks track
    const standaloneTasks = tasks.filter((t) => {
      const tPId =
        t.projectId ||
        (typeof t.project === "string" ? t.project : null) ||
        t.project?._id ||
        t.project?.id;
      return !tPId || t.isIndividual || t.projectName === "Individual Task";
    });

    if (standaloneTasks.length > 0) {
      const colorTokens = deriveProjectColorTokens(STANDALONE_TASK_COLOR);
      const { subRows, subRowCount } = packTasksIntoSubRows(
        standaloneTasks,
        timelineStart,
        timelineEnd,
      );

      result.push({
        id: "individual-tasks-track",
        title: "Individual Tasks",
        category: "Personal & Unassigned",
        key: "IND",
        themeColor: STANDALONE_TASK_COLOR,
        colorTokens,
        subRows,
        subRowCount,
        taskCount: standaloneTasks.length,
        isIndividual: true,
      });
    }

    return result;
  }, [projects, tasks, timelineStart, timelineEnd]);

  const toggleTrackCollapse = (trackId) => {
    setCollapsedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  // Hover handlers with debounce / anti-flicker protection
  const handleHoverStart = (task, colorTokens, projectName, anchorRect) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredData({
      task,
      colorTokens,
      projectName,
      anchorRect,
    });
  };

  const handleHoverEnd = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredData(null);
    }, 120);
  };

  const handleHoverCardEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleHoverCardLeave = () => {
    handleHoverEnd();
  };

  // Skeleton loading state
  if (loading && tracks.length === 0) {
    return (
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="p-8 space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-4">
              <div className="w-48 h-10 bg-slate-100 rounded-xl animate-pulse shrink-0" />
              <div className="flex-1 h-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-12 text-center bg-rose-50/50 border border-rose-100 rounded-3xl">
        <AlertCircle size={36} className="mx-auto text-rose-500 mb-2" />
        <h3 className="text-sm font-bold text-slate-800">
          Failed to load schedule timeline
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
      </Card>
    );
  }

  const hasAnyTasks = tracks.some((t) => t.taskCount > 0);

  return (
    <Card className="p-0 overflow-hidden relative shadow-[0_10px_35px_-5px_rgba(0,0,0,0.04)] border-slate-200/80">
      {tracks.length > 0 && hasAnyTasks ? (
        <div className="overflow-x-auto select-none">
          <div className="min-w-225 lg:min-w-275">
            {/* Header Row: Left Tracks Title + Right Timeline Date Intervals */}
            <div className="grid grid-cols-12 border-b border-slate-200/90 bg-[#F8FAFC]">
              {/* Left Column Header */}
              <div className="col-span-3 lg:col-span-3 p-3.5 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-r border-slate-200/80">
                <span className="flex items-center gap-2">
                  <FolderKanban size={14} className="text-slate-400" />
                  Projects & Tracks
                </span>
                <span className="text-[10px] text-slate-400 font-semibold lowercase">
                  ({tracks.length} tracks)
                </span>
              </div>

              {/* Right Date Ruler Columns */}
              <div
                className="col-span-9 lg:col-span-9 grid divide-x divide-slate-200/80 relative"
                style={{
                  gridTemplateColumns: `repeat(${intervals.length}, minmax(0, 1fr))`,
                }}
              >
                {intervals.map((interval) => (
                  <div
                    key={interval.id}
                    className={`py-2.5 px-1 text-center transition-colors ${
                      interval.isToday
                        ? "bg-indigo-50/70"
                        : interval.isWeekend
                          ? "bg-slate-50/50"
                          : ""
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-tight ${
                        interval.isToday ? "text-[#4361EE]" : "text-slate-400"
                      }`}
                    >
                      {interval.label}
                    </p>
                    <div
                      className={`mt-0.5 inline-flex w-6.5 h-6.5 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        interval.isToday
                          ? "bg-[#4361EE] text-white shadow-xs"
                          : "text-slate-700"
                      }`}
                    >
                      {interval.subLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Tracks Body */}
            <div className="divide-y divide-slate-100">
              {tracks.map((track) => {
                const isCollapsed = Boolean(collapsedTracks[track.id]);
                const subRowHeight = 44; // height of each stacked task bar row in px
                const trackContentHeight = isCollapsed
                  ? 0
                  : Math.max(1, track.subRowCount) * subRowHeight + 14;

                return (
                  <div
                    key={track.id}
                    className="grid grid-cols-12 hover:bg-slate-50/30 transition-colors group"
                  >
                    {/* Left: Project Header & Metadata */}
                    <div className="col-span-3 lg:col-span-3 p-3.5 px-5 flex items-center justify-between border-r border-slate-200/80 bg-white">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Project Theme Color Pill / Dot */}
                        <div
                          className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: track.themeColor }}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4
                              className="font-bold text-xs text-slate-900 leading-tight truncate"
                              title={track.title}
                            >
                              {track.title}
                            </h4>
                            {track.key && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 shrink-0">
                                {track.key}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 block truncate mt-0.5">
                            {track.category} · {track.taskCount} task
                            {track.taskCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Collapse Toggle */}
                      {track.taskCount > 0 && (
                        <button
                          onClick={() => toggleTrackCollapse(track.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-2"
                          title={
                            isCollapsed ? "Expand track" : "Collapse track"
                          }
                        >
                          {isCollapsed ? (
                            <ChevronRight size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Right: Gantt Canvas Grid for this track */}
                    <div
                      className="col-span-9 lg:col-span-9 relative"
                      style={{
                        minHeight: isCollapsed
                          ? "36px"
                          : `${trackContentHeight}px`,
                      }}
                    >
                      {/* Vertical Grid Columns (Dashed hairline borders) */}
                      <div
                        className="absolute inset-0 grid divide-x divide-slate-100/90 pointer-events-none"
                        style={{
                          gridTemplateColumns: `repeat(${intervals.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {intervals.map((interval) => (
                          <div
                            key={interval.id}
                            className={`h-full border-r border-dashed border-slate-200/70 ${
                              interval.isToday
                                ? "bg-indigo-50/20"
                                : interval.isWeekend
                                  ? "bg-slate-50/25"
                                  : ""
                            }`}
                          />
                        ))}
                      </div>

                      {/* Visible Today Marker Line */}
                      {todayPositionPercent !== null && (
                        <div
                          className="absolute inset-y-0 w-0.5 bg-[#4361EE] z-20 pointer-events-none shadow-xs"
                          style={{ left: `${todayPositionPercent}%` }}
                        />
                      )}

                      {/* Render Task Bars inside their respective packed sub-rows */}
                      {!isCollapsed && track.taskCount > 0 ? (
                        <div className="relative w-full h-full p-2">
                          {track.subRows.map((rowTasks, rIdx) => {
                            const topPx = rIdx * subRowHeight + 5;

                            return (
                              <div
                                key={rIdx}
                                className="relative w-full"
                                style={{ height: "38px", top: `${topPx}px` }}
                              >
                                {rowTasks.map((task) => (
                                  <TimelineTaskBar
                                    key={task.id || task._id}
                                    task={task}
                                    colorTokens={track.colorTokens}
                                    projectName={track.title}
                                    onClick={onTaskClick}
                                    onHoverStart={handleHoverStart}
                                    onHoverEnd={handleHoverEnd}
                                  />
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ) : isCollapsed ? (
                        <div className="flex items-center px-4 h-full text-[11px] text-slate-400 italic">
                          Track collapsed ({track.taskCount} tasks hidden)
                        </div>
                      ) : (
                        <div className="flex items-center px-4 h-full text-[11px] text-slate-400 italic">
                          No scheduled deliverables in this project
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-14 text-center bg-slate-50/40 rounded-3xl border border-dashed border-slate-200 m-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4361EE] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Calendar size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No Timeline Milestones Found
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            There are no tasks matching your active filters or date window.
            Create new tasks with start and due dates to track live Gantt
            sprints here.
          </p>
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#4361EE] text-white hover:bg-indigo-600 shadow-xs transition-all"
            >
              <Plus size={14} />
              <span>Create Task</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Task Overview Hover Card */}
      {hoveredData && (
        <TimelineTaskHoverCard
          task={hoveredData.task}
          colorTokens={hoveredData.colorTokens}
          projectName={hoveredData.projectName}
          anchorRect={hoveredData.anchorRect}
          onOpenDetails={onTaskClick}
          onMouseEnter={handleHoverCardEnter}
          onMouseLeave={handleHoverCardLeave}
        />
      )}
    </Card>
  );
};

export default TimelineCalendarGrid;
