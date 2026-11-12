import React from 'react';
import { CheckSquare } from 'lucide-react';
import { TaskCard } from './TaskCard.jsx';
import { EmptyState } from '../../../shared/components/ui/EmptyState.jsx';

export const TaskList = ({ tasks = [], onTaskClick }) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="Try changing filters or add a new task to your workspace."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id || task._id} task={task} onClick={() => onTaskClick?.(task)} />
      ))}
    </div>
  );
};

export default TaskList;
