import React from 'react';
import { TaskCard } from './TaskCard.jsx';

export const TaskList = ({ tasks, onTaskClick }) => {
  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No tasks found</p>
        <p className="text-xs text-slate-400 mt-1">Try changing filters or add a new task.</p>
      </div>
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
