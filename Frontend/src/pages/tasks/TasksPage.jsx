import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../shared/components/layout/PageHeader.jsx";
import { Button } from "../../shared/components/ui/Button.jsx";
import { Modal } from "../../shared/components/ui/Modal.jsx";
import { TaskList } from "../../features/tasks/components/TaskList.jsx";
import { TaskFilter } from "../../features/tasks/components/TaskFilter.jsx";
import { CreateTaskModal } from "../../features/tasks/components/CreateTaskModal.jsx";
import { TaskDetails } from "../../features/tasks/components/TaskDetails.jsx";
import { useTasks } from "../../features/tasks/hooks/useTasks.js";
import { ROUTES } from "../../shared/constants/routes.js";
import { Plus, Maximize2 } from "lucide-react";

/**
 * Presentation Layer: TasksPage
 * Layer: pages/tasks/
 * Responsibility: Task overview, filtering, Kanban/list view, modal creation and full-page navigation.
 */
export const TasksPage = () => {
  const navigate = useNavigate();
  const { tasks, filter, setFilter, addTask } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleCreate = (data) => {
    addTask(data);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        subtitle="Manage and organize your team's workflow."
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white shadow-md shadow-indigo-100"
            >
              <Plus size={16} />
              <span>Create Task</span>
            </Button>
            <button
              onClick={() => navigate(ROUTES.CREATE_TASK)}
              title="Open full Create Task page"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors hidden sm:flex items-center justify-center"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        }
      />

      <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
      <TaskList tasks={tasks} onTaskClick={(task) => setSelectedTask(task)} />

      {/* Modern Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Task Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Overview"
        maxWidth="max-w-2xl"
      >
        <TaskDetails
          task={selectedTask}
          taskId={selectedTask?.id || selectedTask?._id}
          onUpdate={(updated) => setSelectedTask(updated)}
          onDelete={() => setSelectedTask(null)}
          onClose={() => setSelectedTask(null)}
        />
      </Modal>
    </div>
  );
};

export default TasksPage;
