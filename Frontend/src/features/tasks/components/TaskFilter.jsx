import React from 'react';
import { TASK_STATUS } from '../../../shared/constants/taskStatus.js';

export const TaskFilter = ({ currentFilter, onFilterChange }) => {
  const filterOptions = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'INDIVIDUAL', label: 'Self / Individual' },
    ...Object.values(TASK_STATUS).map((status) => ({
      id: status,
      label: status.replace('_', ' '),
    })),
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {filterOptions.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
            currentFilter === f.id
              ? 'bg-[#4361EE] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};
