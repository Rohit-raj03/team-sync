import React, { useState } from "react";
import { ListChecks, Plus, Check, Edit2, Trash2, X } from "lucide-react";

const getSubtaskId = (sub, idx) => sub?.id || sub?._id || `st-${idx}`;

export const TaskSubtasksSection = ({
  subtasks = [],
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
  onUpdateSubtaskTitle,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");

  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedCount / subtasks.length) * 100)
      : 0;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask?.(newSubtaskTitle.trim());
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const handleSaveTitle = (sId, e) => {
    e?.stopPropagation?.();
    if (!editingSubtaskTitle.trim()) return;
    onUpdateSubtaskTitle?.(sId, editingSubtaskTitle.trim(), e);
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  return (
    <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={15} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Subtasks Checklist ({completedCount}/{subtasks.length})
          </span>
          <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded-md">
            Sub-items
          </span>
        </div>

        <div className="flex items-center gap-2">
          {subtasks.length > 0 && (
            <span className="text-[11px] font-semibold text-slate-500">
              {progressPercent}% complete
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsAddingSubtask((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Subtask</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Interactive Clickable Checklist */}
      {subtasks.length > 0 ? (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {subtasks.map((sub, idx) => {
            const sId = getSubtaskId(sub, idx);
            const isEditing = editingSubtaskId === sId;

            return (
              <div
                key={sId}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  sub.completed
                    ? "bg-slate-50/80 border-slate-200/60"
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs"
                }`}
              >
                {isEditing ? (
                  <div
                    className="flex items-center gap-2 flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle(sId, e);
                        if (e.key === "Escape") setEditingSubtaskId(null);
                      }}
                      autoFocus
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSaveTitle(sId, e)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                      title="Save title"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSubtaskId(null);
                      }}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={(e) => onToggleSubtask?.(sId, e)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none group"
                    >
                      {/* Clickable Tick Box */}
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          sub.completed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300 group-hover:border-primary bg-white"
                        }`}
                      >
                        {sub.completed && <Check size={11} strokeWidth={3} />}
                      </div>

                      <span
                        className={`text-xs transition-colors truncate ${
                          sub.completed
                            ? "line-through text-slate-400 font-normal"
                            : "text-slate-800 font-medium group-hover:text-primary"
                        }`}
                      >
                        {sub.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {/* Edit subtask title button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSubtaskId(sId);
                          setEditingSubtaskTitle(sub.title);
                        }}
                        title="Edit subtask title"
                        className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>

                      {/* Delete subtask button */}
                      <button
                        type="button"
                        onClick={(e) => onRemoveSubtask?.(sId, e)}
                        title="Delete subtask"
                        className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
          <p className="text-xs text-slate-400 font-medium">
            No subtasks added yet.
          </p>
        </div>
      )}

      {/* Inline Add Subtask Input Form */}
      {isAddingSubtask && (
        <form
          onSubmit={handleAddSubmit}
          className="flex gap-2 pt-1 animate-in fade-in duration-150"
        >
          <input
            type="text"
            autoFocus
            placeholder="Enter new subtask title..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!newSubtaskTitle.trim()}
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setNewSubtaskTitle("");
              setIsAddingSubtask(false);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default TaskSubtasksSection;
