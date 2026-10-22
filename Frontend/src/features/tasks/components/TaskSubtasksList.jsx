import React, { useState } from "react";
import { Plus, Check, Trash2, ListChecks, Edit2, X, CornerDownRight } from "lucide-react";

/**
 * Feature Component: TaskSubtasksList
 * Layer: features/tasks/components/
 * Responsibility: Interactive subtasks checklist with clear subordinate visual hierarchy, progress calculation, check toggles, item removal, and inline editing.
 */
export const TaskSubtasksList = ({ subtasks = [], onChange }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedCount / subtasks.length) * 100)
      : 0;

  const getItemId = (item, idx) =>
    (item.id || item._id || `st-${idx}`).toString();

  const handleAdd = (e) => {
    e?.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newItem = {
      id: `st-${Date.now()}`,
      _id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    onChange([...subtasks, newItem]);
    setNewSubtaskTitle("");
  };

  const handleToggle = (targetId, e) => {
    e?.stopPropagation();
    onChange(
      subtasks.map((item, idx) => {
        const id = getItemId(item, idx);
        return id === targetId ? { ...item, completed: !item.completed } : item;
      })
    );
  };

  const handleRemove = (targetId, e) => {
    e?.stopPropagation();
    onChange(
      subtasks.filter((item, idx) => {
        const id = getItemId(item, idx);
        return id !== targetId;
      })
    );
  };

  const handleStartEdit = (item, idx, e) => {
    e?.stopPropagation();
    const id = getItemId(item, idx);
    setEditingSubtaskId(id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = (targetId, e) => {
    e?.stopPropagation();
    if (!editingTitle.trim()) return;

    onChange(
      subtasks.map((item, idx) => {
        const id = getItemId(item, idx);
        return id === targetId
          ? { ...item, title: editingTitle.trim() }
          : item;
      })
    );
    setEditingSubtaskId(null);
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setEditingSubtaskId(null);
    setEditingTitle("");
  };

  return (
    <div className="space-y-3">
      {/* Subtasks Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-[#4361EE]" />
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Subtasks & Breakdown
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Actionable checklist items under this task
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
            Sub-items
          </span>
          {subtasks.length > 0 && (
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {completedCount}/{subtasks.length} ({progressPercent}%)
            </span>
          )}
        </div>
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

      {/* Indented Subtasks Tree Container */}
      <div className="border-l-2 border-indigo-200/80 pl-3 ml-1.5 space-y-1.5">
        {subtasks.length > 0 ? (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {subtasks.map((item, idx) => {
              const itemId = getItemId(item, idx);
              const isEditing = editingSubtaskId === itemId;

              return (
                <div
                  key={itemId}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all text-xs ${
                    item.completed
                      ? "bg-slate-50/70 border-slate-200/60 text-slate-400"
                      : "bg-white border-slate-200 hover:border-indigo-200 text-slate-700 shadow-2xs"
                  }`}
                >
                  {isEditing ? (
                    <div
                      className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(itemId, e);
                          if (e.key === "Escape") handleCancelEdit(e);
                        }}
                        autoFocus
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#4361EE] bg-white text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveEdit(itemId, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={(e) => handleToggle(itemId, e)}
                        className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 select-none group"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                            item.completed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-300 group-hover:border-[#4361EE] bg-white"
                          }`}
                        >
                          {item.completed && (
                            <Check size={10} strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`text-xs truncate ${
                            item.completed
                              ? "line-through text-slate-400 font-normal"
                              : "text-slate-700 font-medium group-hover:text-slate-900"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(item, idx, e)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit subtask title"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemove(itemId, e)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete subtask"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic py-1">
            No subtasks added. Add smaller deliverables below.
          </p>
        )}

        {/* Add Subtask Input Form */}
        <div className="flex gap-2 pt-1">
          <div className="relative flex-1">
            <CornerDownRight
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Add a subtask step..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd(e);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newSubtaskTitle.trim()}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4361EE] border border-indigo-200/80 text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Step</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSubtasksList;
