import React, { useState } from "react";
import { Plus, Check, Trash2, ListChecks, Edit2, X } from "lucide-react";

/**
 * Feature Component: TaskSubtasksList
 * Layer: features/tasks/components/
 * Responsibility: Interactive subtasks checklist with progress calculation, check toggles, item removal, and inline editing.
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
          {subtasks.map((item, idx) => {
            const itemId = getItemId(item, idx);
            const isEditing = editingSubtaskId === itemId;

            return (
              <div
                key={itemId}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  item.completed
                    ? "bg-slate-50 border-slate-200/60 text-slate-400"
                    : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
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
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Save"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={(e) => handleToggle(itemId, e)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 select-none"
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

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={(e) => handleStartEdit(item, idx, e)}
                        className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit subtask"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemove(itemId, e)}
                        className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete subtask"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
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

export default TaskSubtasksList;
