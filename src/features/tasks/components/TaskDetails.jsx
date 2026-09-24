import React from 'react';
import { TaskStatus } from './TaskStatus.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { getPriorityBadgeVariant } from '../utils/taskHelpers.js';
import { formatDate } from '../../../shared/utils/formatDate.js';

export const TaskDetails = ({ task }) => {
  if (!task) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <TaskStatus status={task.status} />
        <Badge variant={getPriorityBadgeVariant(task.priority)}>
          {task.priority} Priority
        </Badge>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{task.title}</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>Assignee: {task.assignedTo}</span>
      </div>
    </div>
  );
};
