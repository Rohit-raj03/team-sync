import React from 'react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';
import { TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

const PRIORITIES = [
  {
    value: TASK_PRIORITY.LOW,
    label: 'Low',
    icon: ArrowDown,
    color: 'text-slate-600',
    activeBg: 'bg-slate-100 text-slate-900 border-slate-300 ring-2 ring-slate-200',
    idleBg: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
  },
  {
    value: TASK_PRIORITY.MEDIUM,
    label: 'Medium',
    icon: Minus,
    color: 'text-amber-500',
    activeBg: 'bg-amber-50 text-amber-900 border-amber-300 ring-2 ring-amber-200',
    idleBg: 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50/50',
  },
  {
    value: TASK_PRIORITY.HIGH,
    label: 'High',
    icon: ArrowUp,
    color: 'text-orange-500',
    activeBg: 'bg-orange-50 text-orange-900 border-orange-300 ring-2 ring-orange-200',
    idleBg: 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50/50',
  },
  {
    value: TASK_PRIORITY.URGENT,
    label: 'Urgent',
    icon: AlertTriangle,
    color: 'text-rose-500',
    activeBg: 'bg-rose-50 text-rose-900 border-rose-300 ring-2 ring-rose-200',
    idleBg: 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50/50',
  },
];

/**
 * Feature Component: TaskPrioritySelector
 * Layer: features/tasks/components/
 * Responsibility: Interactive priority level selector with Low, Medium, High, and Urgent badges and icons.
 */
export const TaskPrioritySelector = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Priority
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRIORITIES.map((p) => {
          const Icon = p.icon;
          const isSelected = value === p.value;
          return (
            <button
              type="button"
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSelected ? p.activeBg : p.idleBg
              }`}
            >
              <Icon size={14} className={isSelected ? 'currentColor' : p.color} />
              <span>{p.label}</span>
              {isSelected && p.value === TASK_PRIORITY.URGENT && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

