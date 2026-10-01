import React, { useState } from "react";
import { Plus, Check, Trash2, ListChecks } from "lucide-react";

/**
 * Feature Component: TaskSubtasksList
 * Layer: features/tasks/components/
 * Responsibility: Interactive subtasks checklist with progress calculation, check toggles, and item removal.
 */
export const TaskSubtasksList = ({ subtasks = [], onChange }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedCount / subtasks.length) * 100)
      : 0;

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newItem = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    onChange([...subtasks, newItem]);
    setNewSubtaskTitle("");
  };

  const handleToggle = (id) => {
    onChange(
      subtasks.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const handleRemove = (id) => {
    onChange(subtasks.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-slate-500" />
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Subtasks
          </label>
        </div>
        {subtasks.length > 0 && (
          <span className="text-[11px] font-semibold text-slate-500">
            {completedCount} of {subtasks.length} completed ({progressPercent}%)
          </span>
        )}
      </div>

      {/* Progress Bar when subtasks exist */}
      {subtasks.length > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#4361EE] h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      {subtasks.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {subtasks.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                item.completed
                  ? "bg-slate-50 border-slate-200/60 text-slate-400"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <div
                onClick={() => handleToggle(item.id)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    item.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                >
                  {item.completed && <Check size={12} strokeWidth={3} />}
                </div>
                <span
                  className={`text-xs font-medium truncate ${
                    item.completed
                      ? "line-through text-slate-400"
                      : "text-slate-700"
                  }`}
                >
                  {item.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                aria-label="Delete subtask"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Subtask Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a subtask (press Enter to add)..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newSubtaskTitle.trim()}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-[#4361EE] text-slate-700 text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shrink-0"
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
