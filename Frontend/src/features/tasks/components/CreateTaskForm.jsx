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

const formatDateForInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const resolveInitialFormData = (init, isEdit) => {
  const pId =
    init?.projectId ||
    (typeof init?.project === "string" ? init.project : null) ||
    init?.project?._id ||
    init?.project?.id ||
    "";

  return {
    title: init?.title || "",
    description: init?.description || "",
    projectId: pId,
    priority: init?.priority || TASK_PRIORITY.MEDIUM,
    status: init?.status || TASK_STATUS.TODO,
    startDate:
      formatDateForInput(init?.startDate) ||
      (isEdit ? "" : new Date().toISOString().split("T")[0]),
    dueDate:
      formatDateForInput(init?.dueDate) ||
      (isEdit
        ? ""
        : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]),
    estimatedTime: init?.estimatedTime || "8h",
    assignees: Array.isArray(init?.assignees)
      ? init.assignees.map((a) =>
          typeof a === "object"
            ? { ...a, id: a.id || a._id }
            : { id: a }
        )
      : [],
    tags: Array.isArray(init?.tags) ? init.tags : [],
    subtasks: Array.isArray(init?.subtasks) ? init.subtasks : [],
    attachments: Array.isArray(init?.attachments) ? init.attachments : [],
    comment: init?.comment || "",
  };
};

/**
 * Feature Component: CreateTaskForm
 * Layer: features/tasks/components/
 * Responsibility: Comprehensive task creation and editing form implementing full metadata,
 * prefilling, assignee multi-select, schedule timeline dates, checklist, file attachments, and validation states.
 */
export const CreateTaskForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
}) => {
  const isEditMode = mode === "edit" || Boolean(initialData.id || initialData._id);
  const { allProjects } = useProjects();
  const { members: allTeamMembers } = useTeam();
  const availableProjects = allProjects || [];

  const [formData, setFormData] = useState(() =>
    resolveInitialFormData(initialData, isEditMode)
  );

  const [serverError, setServerError] = useState("");
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const submitting = isSubmitting || internalSubmitting;

  useEffect(() => {
    if (initialData && (initialData.id || initialData._id || initialData.title)) {
      setFormData(resolveInitialFormData(initialData, isEditMode));
      setServerError("");
    }
  }, [initialData, isEditMode]);

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
    if (submitting) return;
    setServerError("");
    if (!validate()) return;

    if (onSubmit) {
      setInternalSubmitting(true);
      try {
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
              ? formData.assignees.map((a) => a.name || a.username || "Member").join(", ")
              : "Unassigned",
        };

        await onSubmit(submissionData);
        setIsSuccess(true);
      } catch (err) {
        console.error("Task submission error:", err);
        setServerError(
          err.response?.data?.message ||
          err.message ||
          "Failed to save task. Please verify your permissions and input."
        );
      } finally {
        setInternalSubmitting(false);
      }
    }
  };

  const applyTimePreset = (preset) => {
    setFormData((prev) => ({ ...prev, estimatedTime: preset }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Server Error Banner */}
      {serverError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

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
          {/* Task Title (Primary Hero Field) */}
          <div className="p-4 rounded-3xl bg-linear-to-b from-indigo-50/40 to-white border border-indigo-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#4361EE] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                  Primary Task
                </span>
                <label
                  htmlFor="task-title"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-800"
                >
                  Task Title <span className="text-rose-500">*</span>
                </label>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
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
              className={`w-full px-4 py-3 rounded-2xl border text-base font-bold transition-all ${
                errors.title
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20 text-rose-900"
                  : "border-slate-200 focus:ring-2 focus:ring-[#4361EE] focus:border-transparent bg-white text-slate-900"
              } placeholder-slate-400 shadow-xs`}
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
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-2xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>{isEditMode ? "Updating Task..." : "Creating Task..."}</span>
            </>
          ) : (
            <>
              <Check size={15} strokeWidth={2.5} />
              <span>{isEditMode ? "Update Task" : "Create Task"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
