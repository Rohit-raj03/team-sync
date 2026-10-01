import React from "react";
import { Circle, Clock, Eye, CheckCircle2 } from "lucide-react";
import { TASK_STATUS } from "../../../shared/constants/taskStatus.js";

const STATUSES = [
  {
    value: TASK_STATUS.TODO,
    label: "To Do",
    icon: Circle,
    activeClass: "bg-slate-800 text-white border-slate-800 shadow-xs",
    idleClass: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
    dotColor: "bg-slate-400",
  },
  {
    value: TASK_STATUS.IN_PROGRESS,
    label: "In Progress",
    icon: Clock,
    activeClass: "bg-[#4361EE] text-white border-[#4361EE] shadow-xs",
    idleClass: "bg-white text-slate-600 border-slate-200 hover:bg-indigo-50/50",
    dotColor: "bg-indigo-500",
  },
  {
    value: TASK_STATUS.IN_REVIEW,
    label: "Review",
    icon: Eye,
    activeClass: "bg-purple-600 text-white border-purple-600 shadow-xs",
    idleClass: "bg-white text-slate-600 border-slate-200 hover:bg-purple-50/50",
    dotColor: "bg-purple-500",
  },
  {
    value: TASK_STATUS.COMPLETED,
    label: "Done",
    icon: CheckCircle2,
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-xs",
    idleClass:
      "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50/50",
    dotColor: "bg-emerald-500",
  },
];

/**
 * Feature Component: TaskStatusSelector
 * Layer: features/tasks/components/
 * Responsibility: Interactive selector for task states (To Do, In Progress, Review, Done).
 */
export const TaskStatusSelector = ({ value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
        Status
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
        {STATUSES.map((s) => {
          const Icon = s.icon;
          const isSelected = value === s.value;
          return (
            <button
              type="button"
              key={s.value}
              onClick={() => onChange(s.value)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSelected ? s.activeClass : s.idleClass
              }`}
            >
              <Icon size={14} className={isSelected ? "text-white" : ""} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
