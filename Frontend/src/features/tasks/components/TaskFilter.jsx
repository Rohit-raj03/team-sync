import React from 'react';
import { TASK_STATUS } from '../../../shared/constants/taskStatus.js';

export const TaskFilter = ({ currentFilter, onFilterChange }) => {
  const filters = ['ALL', ...Object.values(TASK_STATUS)];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onFilterChange(f)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
            currentFilter === f
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {f.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};
