import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { TimelineHeader } from "../../features/timeline/components/TimelineHeader.jsx";
import { TimelineSummaryCards } from "../../features/timeline/components/TimelineSummaryCards.jsx";
import { TimelineCalendarGrid } from "../../features/timeline/components/TimelineCalendarGrid.jsx";
import { useProjects } from "../../features/projects/hooks/useProjects.js";
import { useTasks } from "../../features/tasks/hooks/useTasks.js";
import { Modal } from "../../shared/components/ui/Modal.jsx";
import { TaskDetails } from "../../features/tasks/components/TaskDetails.jsx";
import { CreateTaskModal } from "../../features/tasks/components/CreateTaskModal.jsx";
import { ROUTES } from "../../shared/constants/routes.js";
import {
  generateTimelineRange,
  shiftAnchorDate,
} from "../../features/timeline/utils/timelineDateUtils.js";

/**
 * Presentation Layer: TimelinePage
 * Layer: pages/timeline/
 * Responsibility: Complete interactive Gantt roadmap orchestrator. Connects live projects and tasks,
 * coordinates date navigation, multi-filter criteria, floating hover overviews, task creation,
 * and comprehensive task detail modal inspection.
 */
export const TimelinePage = () => {
  const navigate = useNavigate();
  const {
    projects = [],
    loading: projectsLoading,
    error: projectsError,
    fetchProjects,
  } = useProjects();
  const {
    allTasks = [],
    loading: tasksLoading,
    error: tasksError,
    addTask,
    updateTask,
    fetchTasks,
  } = useTasks();

  // Navigation & Scale View State
  const [viewMode, setViewMode] = useState("Day"); // 'Day' | 'Week' | 'Month' | 'Quarter'
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  // Filter State
  const [filters, setFilters] = useState({
    project: "ALL",
    status: "ALL",
    priority: "ALL",
    search: "",
  });

  // Task Details Modal & Creation State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Auto fetch live data on mount
  useEffect(() => {
    fetchProjects?.();
    fetchTasks?.();
  }, [fetchProjects, fetchTasks]);

  // Compute active range title for header
  const { rangeTitle } = useMemo(() => {
    return generateTimelineRange(anchorDate, viewMode);
  }, [anchorDate, viewMode]);

  // Handle date shifting
  const handlePrev = () => {
    setAnchorDate((prev) => shiftAnchorDate(prev, viewMode, -1));
  };

  const handleNext = () => {
    setAnchorDate((prev) => shiftAnchorDate(prev, viewMode, 1));
  };

  const handleToday = () => {
    setAnchorDate(new Date());
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      project: "ALL",
      status: "ALL",
      priority: "ALL",
      search: "",
    });
  };

  // Apply filters to tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // 1. Project filter
      if (filters.project !== "ALL") {
        const pId =
          task.projectId ||
          (typeof task.project === "string" ? task.project : null) ||
          task.project?._id ||
          task.project?.id;
        if (pId !== filters.project && String(pId) !== String(filters.project)) {
          return false;
        }
      }

      // 2. Status filter
      if (filters.status !== "ALL") {
        const normStatus = (task.status || "").toUpperCase().replace(/\s+/g, "_");
        const normFilter = filters.status.toUpperCase().replace(/\s+/g, "_");
        if (normStatus !== normFilter) {
          return false;
        }
      }

      // 3. Priority filter
      if (filters.priority !== "ALL") {
        const normPriority = (task.priority || "").toUpperCase();
        if (normPriority !== filters.priority.toUpperCase()) {
          return false;
        }
      }

      // 4. Search query filter
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const inTitle = task.title?.toLowerCase().includes(q);
        const inDesc = task.description?.toLowerCase().includes(q);
        const inTags = Array.isArray(task.tags) && task.tags.some((t) => t.toLowerCase().includes(q));
        const inAssignee =
          task.assignedTo?.toLowerCase().includes(q) ||
          (Array.isArray(task.assignees) &&
            task.assignees.some((a) => a.name?.toLowerCase().includes(q)));

        if (!inTitle && !inDesc && !inTags && !inAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [allTasks, filters]);

  // Handle task creation
  const handleCreateTask = async (taskData) => {
    try {
      await addTask(taskData);
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Failed to create task from timeline:", err);
    }
  };

  // Handle task bar click -> open modal
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  // Handle navigate to full task details page
  const handleOpenFullPage = () => {
    if (selectedTask?.id || selectedTask?._id) {
      const id = selectedTask.id || selectedTask._id;
      navigate(ROUTES.TASK_DETAILS(id));
    }
  };

  const isLoading = (projectsLoading || tasksLoading) && allTasks.length === 0;
  const currentError = projectsError || tasksError;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with View Controls, Navigation, and Filters */}
      <TimelineHeader
        rangeTitle={rangeTitle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        projects={projects}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onAddTask={() => setIsCreateOpen(true)}
      />

      {/* 2. Sprint KPI Overview Cards with Real Metrics */}
      <TimelineSummaryCards tasks={allTasks} projects={projects} />

      {/* 3. Gantt Milestone & Track Schedule Grid */}
      <TimelineCalendarGrid
        tasks={filteredTasks}
        projects={projects}
        loading={isLoading}
        error={currentError}
        viewMode={viewMode}
        anchorDate={anchorDate}
        onTaskClick={handleTaskClick}
        onAddTask={() => setIsCreateOpen(true)}
      />

      {/* 4. Task Details Modal (Opened on Task Click) */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span className="truncate">Task Details</span>
            {selectedTask && (
              <button
                onClick={handleOpenFullPage}
                className="inline-flex items-center gap-1 text-xs text-[#4361EE] hover:text-indigo-700 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                title="Open in full dedicated page"
              >
                <span>Full Page</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        }
        maxWidth="max-w-3xl"
      >
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            taskId={selectedTask.id || selectedTask._id}
            onUpdate={(updated) => setSelectedTask(updated)}
            onDelete={() => setSelectedTask(null)}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </Modal>

      {/* 5. Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
        title="Add Milestone / Task"
        subtitle="Schedule a project milestone with start and due dates for timeline visualization."
      />
    </div>
  );
};

export default TimelinePage;
