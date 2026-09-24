import React from 'react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge.jsx';
import { getStatusBadgeVariant, getPriorityBadgeVariant } from '../utils/taskHelpers.js';
import { formatDate } from '../../../shared/utils/formatDate.js';

export const TaskCard = ({ task, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge variant={getPriorityBadgeVariant(task.priority)}>
          {task.priority}
        </Badge>
        <Badge variant={getStatusBadgeVariant(task.status)}>
          {task.status.replace('_', ' ')}
        </Badge>
      </div>

      <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
        {task.title}
      </h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
        {task.description || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{formatDate(task.dueDate)}</span>
        </div>
        <span className="font-medium text-slate-600">{task.assignedTo}</span>
      </div>
    </div>
  );
};
