import React, { useState } from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { TaskList } from '../../features/tasks/components/TaskList.jsx';
import { TaskFilter } from '../../features/tasks/components/TaskFilter.jsx';
import { TaskForm } from '../../features/tasks/components/TaskForm.jsx';
import { TaskDetails } from '../../features/tasks/components/TaskDetails.jsx';
import { useTasks } from '../../features/tasks/hooks/useTasks.js';
import { Plus } from 'lucide-react';

export const TasksPage = () => {
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
          <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create Task</span>
          </Button>
        }
      />

      <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
      <TaskList tasks={tasks} onTaskClick={(task) => setSelectedTask(task)} />

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Task Details Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Overview"
      >
        <TaskDetails task={selectedTask} />
      </Modal>
    </div>
  );
};
