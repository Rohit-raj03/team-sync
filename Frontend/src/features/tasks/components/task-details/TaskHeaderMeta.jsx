import React, { useState } from "react";
import {
  ChevronDown,
  Check,
  FolderKanban,
  Edit2,
  Trash2,
  Save,
} from "lucide-react";
import { Badge } from "../../../../shared/components/ui/Badge.jsx";
import { Avatar } from "../../../../shared/components/ui/Avatar.jsx";
import { formatDate } from "../../../../shared/utils/formatDate.js";
import {
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
} from "../../utils/taskHelpers.js";
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from "../../../../shared/constants/taskStatus.js";
import { MentionTextarea } from "../MentionTextarea.jsx";
import { MentionRenderer } from "../MentionRenderer.jsx";

export const TaskHeaderMeta = ({
  task,
  effectiveMembers = [],
  onStatusChange,
  onPriorityChange,
  onSaveMeta,
  onOpenEditModal,
  onOpenDeleteModal,
}) => {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  const [editTitle, setEditTitle] = useState(task?.title || "");
  const [editDescription, setEditDescription] = useState(
    task?.description || ""
  );
  const [editDueDate, setEditDueDate] = useState(task?.dueDate || "");
  const [editEstimatedTime, setEditEstimatedTime] = useState(
    task?.estimatedTime || "8h"
  );

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onSaveMeta?.({
      title: editTitle.trim(),
      description: editDescription.trim(),
      dueDate: editDueDate || task.dueDate,
      estimatedTime: editEstimatedTime || task.estimatedTime,
    });
    setIsEditingMeta(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditDueDate(task.dueDate || "");
    setEditEstimatedTime(task.estimatedTime || "8h");
    setIsEditingMeta(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Badges & Quick Dropdowns Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Interactive Status Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusMenuOpen((prev) => !prev);
                setIsPriorityMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 focus:outline-none group cursor-pointer"
              title="Click to change status"
            >
              <Badge variant={getStatusBadgeVariant(task.status)}>
                <span>{task.status?.replace("_", " ") || "TO DO"}</span>
                <ChevronDown
                  size={11}
                  className="ml-0.5 opacity-60 group-hover:opacity-100"
                />
              </Badge>
            </button>

            {isStatusMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-40 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Change Status
                </p>
                {Object.values(TASK_STATUS).map((statusVal) => (
                  <button
                    key={statusVal}
                    type="button"
                    onClick={() => {
                      onStatusChange?.(statusVal);
                      setIsStatusMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      task.status === statusVal
                        ? "bg-indigo-50 text-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{statusVal.replace("_", " ")}</span>
                    {task.status === statusVal && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Priority Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsPriorityMenuOpen((prev) => !prev);
                setIsStatusMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 focus:outline-none group cursor-pointer"
              title="Click to change priority"
            >
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                <span>{task.priority} Priority</span>
                <ChevronDown
                  size={11}
                  className="ml-0.5 opacity-60 group-hover:opacity-100"
                />
              </Badge>
            </button>

            {isPriorityMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Set Priority
                </p>
                {Object.values(TASK_PRIORITY).map((prioVal) => (
                  <button
                    key={prioVal}
                    type="button"
                    onClick={() => {
                      onPriorityChange?.(prioVal);
                      setIsPriorityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      task.priority === prioVal
                        ? "bg-indigo-50 text-primary"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{prioVal}</span>
                    {task.priority === prioVal && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Name + Edit & Delete Action Buttons */}
        <div className="flex items-center gap-3">
          {task.isIndividual ||
          (!task.project && !task.projectId) ||
          task.projectName === "Individual Task" ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Self / Individual Task</span>
            </div>
          ) : (
            task.projectName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <FolderKanban size={13} className="text-primary" />
                <span>{task.projectName}</span>
              </div>
            )
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-primary border border-indigo-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Edit2 size={13} />
              <span>Edit Task</span>
            </button>

            <button
              type="button"
              onClick={onOpenDeleteModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-600 border border-rose-100 transition-colors cursor-pointer shadow-2xs"
              title="Delete task with mandatory reason"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Title & Description (View or Inline Edit Mode) */}
      {isEditingMeta ? (
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 animate-in fade-in duration-150">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Description (Type @ to mention team members)
            </label>
            <MentionTextarea
              rows={3}
              value={editDescription}
              onChange={(newVal) => setEditDescription(newVal)}
              projectMembers={effectiveMembers}
              placeholder="Task description with @mentions..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Estimated Time
              </label>
              <input
                type="text"
                placeholder="e.g. 12h or 3d"
                value={editEstimatedTime}
                onChange={(e) => setEditEstimatedTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save size={13} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {task.title}
          </h2>
          <div className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
            {task.description ? (
              <MentionRenderer text={task.description} />
            ) : (
              "No detailed description provided."
            )}
          </div>
        </div>
      )}

      {/* 3. Meta Grid: Dates & Estimation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Start Date
          </span>
          <span className="font-semibold text-slate-700 mt-0.5 block">
            {task.startDate ? formatDate(task.startDate) : "Not specified"}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Due Date
          </span>
          <span className="font-semibold text-slate-700 mt-0.5 block">
            {task.dueDate ? formatDate(task.dueDate) : "No deadline"}
          </span>
        </div>

        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Estimated Time
          </span>
          <span className="font-semibold text-primary mt-0.5 block">
            {task.estimatedTime || "8h"}
          </span>
        </div>
      </div>

      {/* 4. Task Creator */}
      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={task.creator?.avatar}
            name={task.creator?.name || "Task Creator"}
            size="sm"
            className="ring-1 ring-slate-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                {task.creator?.name || "Unknown Creator"}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                Creator
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Created on {formatDate(task.createdAt || task.startDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskHeaderMeta;
