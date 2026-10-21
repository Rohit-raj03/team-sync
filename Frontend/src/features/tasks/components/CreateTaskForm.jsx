import React, { useState } from "react";
import {
  Calendar,
  Clock,
  FolderKanban,
  FileText,
  AlertCircle,
  Check,
  Bold,
  Italic,
  Code,
  List,
  Link as LinkIcon,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from "../../../shared/constants/taskStatus.js";
import { TaskAssigneeSelector } from "./TaskAssigneeSelector.jsx";
import { TaskPrioritySelector } from "./TaskPrioritySelector.jsx";
import { TaskStatusSelector } from "./TaskStatusSelector.jsx";
import { TaskSubtasksList } from "./TaskSubtasksList.jsx";
import { TaskAttachmentsUploader } from "./TaskAttachmentsUploader.jsx";
import { TaskTagsInput } from "./TaskTagsInput.jsx";
import { MentionTextarea } from "./MentionTextarea.jsx";
import { useProjects } from "../../projects/hooks/useProjects.js";
import { useTeam } from "../../team/hooks/useTeam.js";

const ESTIMATION_PRESETS = ["2h", "4h", "1d", "2d", "3d", "1w"];

/**
 * Feature Component: CreateTaskForm
 * Layer: features/tasks/components/
 * Responsibility: Comprehensive task creation form implementing full metadata, assignee multi-select, checklist, file attachments, and validation states.
 */
export const CreateTaskForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { allProjects } = useProjects();
  const { members: allTeamMembers } = useTeam();
  const availableProjects = allProjects || [];

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    projectId: initialData.projectId || "",
    priority: initialData.priority || TASK_PRIORITY.MEDIUM,
    status: initialData.status || TASK_STATUS.TODO,
    startDate: initialData.startDate || new Date().toISOString().split("T")[0],
    dueDate:
      initialData.dueDate ||
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    estimatedTime: initialData.estimatedTime || "8h",
    assignees: initialData.assignees || [],
    tags: initialData.tags || [],
    subtasks: initialData.subtasks || [],
    attachments: initialData.attachments || [],
    comment: initialData.comment || "",
  });

  const selectedProject = availableProjects.find(
    (p) => (p.id || p._id) === formData.projectId,
  );
  // If project is selected and has members, use those; otherwise allow tagging/assigning from all team members
  const projectMembers =
    selectedProject?.members && selectedProject.members.length > 0
      ? selectedProject.members
      : allTeamMembers || [];

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required.";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Task title must be at least 3 characters.";
    }

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        newErrors.dueDate = "Due date cannot be before start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmit) {
      const selectedProj = availableProjects.find(
        (p) => (p.id || p._id) === formData.projectId,
      );
      const submissionData = {
        ...formData,
        projectId: formData.projectId || null,
        projectName: selectedProj ? selectedProj.name : "Individual Task",
        isIndividual: !formData.projectId,
        // For backwards compatibility with single assignedTo:
        assignedTo:
          formData.assignees.length > 0
            ? formData.assignees.map((a) => a.name).join(", ")
            : "Unassigned",
      };

      setIsSuccess(true);
      await onSubmit(submissionData);
    }
  };

  const applyTimePreset = (preset) => {
    setFormData((prev) => ({ ...prev, estimatedTime: preset }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Validation Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <span>
            Please correct the errors highlighted below before submitting.
          </span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Task Content & Documentation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Task Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="task-title"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Task Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.title.length}/100
              </span>
            </div>
            <input
              id="task-title"
              type="text"
              maxLength={100}
              placeholder="e.g. Implement Figma design for Team Sync project dashboard"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                errors.title
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20"
                  : "border-slate-200 focus:ring-2 focus:ring-[#4361EE] focus:border-transparent bg-white"
              } text-slate-900 placeholder-slate-400 shadow-xs`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.title}
              </p>
            )}
          </div>

          {/* Task Description with Rich Toolbar Styling */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description & Acceptance Criteria
              </label>
              <div className="flex items-center gap-1 text-slate-400">
                <FileText size={13} />
                <span className="text-[11px]">Markdown supported</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#4361EE] focus-within:border-transparent transition-all">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-slate-50/70 text-slate-600">
                <button
                  type="button"
                  title="Bold"
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  title="Italic"
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  title="Code snippet"
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Code size={13} />
                </button>
                <span className="w-px h-3.5 bg-slate-200 mx-1" />
                <button
                  type="button"
                  title="Bullet list"
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <List size={13} />
                </button>
                <button
                  type="button"
                  title="Insert link"
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <LinkIcon size={13} />
                </button>
              </div>

              {/* Mention-supported Textarea */}
              <div className="p-2">
                <MentionTextarea
                  rows={5}
                  placeholder="Describe the objective, user story, acceptance criteria, or type @ to mention project team members..."
                  value={formData.description}
                  onChange={(val) =>
                    setFormData({ ...formData, description: val })
                  }
                  projectMembers={projectMembers}
                  className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent border-0 focus:ring-0 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Subtasks (Checklist) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <TaskSubtasksList
              subtasks={formData.subtasks}
              onChange={(newSubtasks) =>
                setFormData({ ...formData, subtasks: newSubtasks })
              }
            />
          </div>

          {/* Attachments Dropzone */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <TaskAttachmentsUploader
              attachments={formData.attachments}
              onChange={(newAttachments) =>
                setFormData({ ...formData, attachments: newAttachments })
              }
            />
          </div>

          {/* Handover Note / Initial Comment */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} className="text-slate-500" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Initial Comment / Handover Note (Optional)
              </label>
            </div>
            <MentionTextarea
              rows={2}
              placeholder="Leave an introductory note or type @ to ping team members on creation..."
              value={formData.comment}
              onChange={(val) => setFormData({ ...formData, comment: val })}
              projectMembers={projectMembers}
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* Right Column: Metadata, Assignees, Dates & Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Project Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FolderKanban size={14} className="text-slate-500" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Project / Context
              </label>
              <span className="text-[10px] text-slate-400 font-normal">
                (Optional - Default is Individual)
              </span>
            </div>
            <select
              value={formData.projectId}
              onChange={(e) => {
                const newProjectId = e.target.value;
                const newProj = availableProjects.find(
                  (p) => (p.id || p._id) === newProjectId,
                );
                const allowedMemberIds =
                  newProj?.members && newProj.members.length > 0
                    ? new Set(
                        newProj.members.map((m) =>
                          (m.id || m._id || m.user?._id || m.user)?.toString(),
                        ),
                      )
                    : null;
                setFormData((prev) => ({
                  ...prev,
                  projectId: newProjectId,
                  assignees: allowedMemberIds
                    ? prev.assignees.filter((a) =>
                        allowedMemberIds.has(
                          (a.id || a._id || a.user?._id || a.user)?.toString(),
                        ),
                      )
                    : prev.assignees,
                }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE] shadow-xs cursor-pointer"
            >
              <option value="">No Project (Individual / Self Task)</option>
              {availableProjects.map((project) => (
                <option
                  key={project.id || project._id}
                  value={project.id || project._id}
                >
                  {project.name}{" "}
                  {project.category ? `(${project.category})` : ""}
                </option>
              ))}
            </select>

            {/* Display Tagged Members in Selected Project OR Individual Task note */}
            {formData.projectId
              ? (() => {
                  const currentProj = availableProjects.find(
                    (p) => (p.id || p._id) === formData.projectId,
                  );
                  if (!currentProj?.members || currentProj.members.length === 0)
                    return null;
                  return (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-400">
                        Tagged in project:
                      </span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {currentProj.members.slice(0, 4).map((m) => (
                          <img
                            key={m.id || m._id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} (${m.projectRole || m.role || "Member"})`}
                            className="w-5 h-5 rounded-full ring-1 ring-white object-cover"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}`;
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({currentProj.members.length} contributors)
                      </span>
                    </div>
                  );
                })()
              : ""}
          </div>

          {/* Status Selector */}
          <TaskStatusSelector
            value={formData.status}
            onChange={(newStatus) =>
              setFormData({ ...formData, status: newStatus })
            }
          />

          {/* Priority Selector */}
          <TaskPrioritySelector
            value={formData.priority}
            onChange={(newPriority) =>
              setFormData({ ...formData, priority: newPriority })
            }
          />

          {/* Assignee Multi-Selector with Project Members */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <TaskAssigneeSelector
              selectedAssignees={formData.assignees}
              availableMembers={
                projectMembers.length > 0 ? projectMembers : undefined
              }
              onChange={(newAssignees) =>
                setFormData({ ...formData, assignees: newAssignees })
              }
            />
          </div>

          {/* Dates & Timeline (Start Date & Due Date) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Schedule & Timeline
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Due Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    setFormData({ ...formData, dueDate: e.target.value });
                    if (errors.dueDate) setErrors({ ...errors, dueDate: null });
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 ${
                    errors.dueDate
                      ? "border-rose-400 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-[#4361EE]"
                  }`}
                />
              </div>
            </div>
            {errors.dueDate && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.dueDate}
              </p>
            )}
          </div>

          {/* Estimated Time */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-500" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Estimated Time
                </label>
              </div>
              <span className="text-xs font-bold text-[#4361EE]">
                {formData.estimatedTime}
              </span>
            </div>

            <input
              type="text"
              placeholder="e.g. 12h or 3d"
              value={formData.estimatedTime}
              onChange={(e) =>
                setFormData({ ...formData, estimatedTime: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            />

            {/* Quick Estimation Pills */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">
                Presets:
              </span>
              {ESTIMATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyTimePreset(preset)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                    formData.estimatedTime === preset
                      ? "bg-[#4361EE] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <TaskTagsInput
              tags={formData.tags}
              onChange={(newTags) =>
                setFormData({ ...formData, tags: newTags })
              }
            />
          </div>
        </div>
      </div>

      {/* Form Action Controls Footer */}
      <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Creating Task...</span>
            </>
          ) : (
            <>
              <Check size={15} strokeWidth={2.5} />
              <span>Create Task</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
