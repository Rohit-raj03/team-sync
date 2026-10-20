import React, { useState } from "react";
import {
  Calendar,
  Clock,
  FolderKanban,
  CheckCircle2,
  Paperclip,
  Tag,
  ListChecks,
  MessageSquare,
  FileText,
  Check,
  Plus,
  Trash2,
  Edit2,
  X,
  UserPlus,
  Users,
  Search,
  ChevronDown,
  Save,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/Badge.jsx";
import {
  getPriorityBadgeVariant,
  getStatusBadgeVariant,
} from "../utils/taskHelpers.js";
import { formatDate } from "../../../shared/utils/formatDate.js";
import { useTasks } from "../hooks/useTasks.js";
import { useTeam } from "../../team/hooks/useTeam.js";
import { useProjects } from "../../projects/hooks/useProjects.js";
import { MentionTextarea } from "./MentionTextarea.jsx";
import { MentionRenderer } from "./MentionRenderer.jsx";
import { TaskComments } from "./TaskComments.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from "../../../shared/constants/taskStatus.js";

/**
 * Feature Component: TaskDetails
 * Layer: features/tasks/components/
 * Responsibility: Complete interactive task overview enabling inline subtask ticking, employee/assignee additions and removals, status transitions, metadata editing, @mentions, and real-time discussion comments.
 */
export const TaskDetails = ({
  task: initialTask,
  taskId,
  onUpdate,
  projectMembers: passedMembers,
}) => {
  const { allTasks, updateTask } = useTasks();
  const { members: teamMembers } = useTeam();
  const { getProjectById } = useProjects();

  // Retrieve the live reactive task from Redux store
  const currentId = taskId || initialTask?.id || initialTask?._id;
  const task =
    allTasks.find((t) => t.id === currentId || t._id === currentId) ||
    initialTask;

  const project = getProjectById(
    task?.projectId || task?.project?._id || task?.project
  );

  const effectiveMembers =
    passedMembers ||
    (project?.members && project.members.length > 0
      ? project.members.map((m) => ({
          id: m.id || m._id || m.user?._id || m.user,
          _id: m.id || m._id || m.user?._id || m.user,
          name: m.name || m.user?.name || "Member",
          username: m.username || m.user?.username || "",
          avatar: m.avatar || m.user?.avatar,
          role: m.projectRole || m.role || "Member",
        }))
      : teamMembers);

  // Local state for editing modes
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || "");
  const [editDescription, setEditDescription] = useState(
    task?.description || "",
  );
  const [editDueDate, setEditDueDate] = useState(task?.dueDate || "");
  const [editEstimatedTime, setEditEstimatedTime] = useState(
    task?.estimatedTime || "8h",
  );

  // Assignee picker dropdown state
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Subtask creation input state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Status & Priority dropdown states
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  if (!task) return null;

  // 1. SUBTASK TICKING / TOGGLE
  const handleToggleSubtask = (subtaskId) => {
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub,
    );

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 2. ADD SUBTASK
  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const updatedTask = {
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  // 3. REMOVE SUBTASK
  const handleRemoveSubtask = (subtaskId, e) => {
    e?.stopPropagation();
    const updatedSubtasks = (task.subtasks || []).filter(
      (s) => s.id !== subtaskId,
    );

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 4. EMPLOYEE / ASSIGNEE EDITING (TOGGLE ASSIGNEE)
  const handleToggleAssignee = (member) => {
    const currentAssignees = task.assignees || [];
    const exists = currentAssignees.some((a) => a.id === member.id);

    let updatedAssignees;
    if (exists) {
      updatedAssignees = currentAssignees.filter((a) => a.id !== member.id);
    } else {
      updatedAssignees = [
        ...currentAssignees,
        {
          id: member.id,
          name: member.name,
          username: member.username,
          role: member.role,
          avatar: member.avatar,
        },
      ];
    }

    const updatedAssignedTo =
      updatedAssignees.length > 0
        ? updatedAssignees.map((a) => a.name).join(", ")
        : "Unassigned";

    const updatedTask = {
      ...task,
      assignees: updatedAssignees,
      assignedTo: updatedAssignedTo,
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 5. QUICK REMOVE SINGLE ASSIGNEE
  const handleRemoveAssignee = (memberId, e) => {
    e?.stopPropagation();
    const updatedAssignees = (task.assignees || []).filter(
      (a) => a.id !== memberId,
    );
    const updatedAssignedTo =
      updatedAssignees.length > 0
        ? updatedAssignees.map((a) => a.name).join(", ")
        : "Unassigned";

    const updatedTask = {
      ...task,
      assignees: updatedAssignees,
      assignedTo: updatedAssignedTo,
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 6. QUICK STATUS CHANGE
  const handleStatusChange = (newStatus) => {
    const updatedTask = {
      ...task,
      status: newStatus,
    };
    updateTask(updatedTask);
    onUpdate?.(updatedTask);
    setIsStatusMenuOpen(false);
  };

  // 7. QUICK PRIORITY CHANGE
  const handlePriorityChange = (newPriority) => {
    const updatedTask = {
      ...task,
      priority: newPriority,
    };
    updateTask(updatedTask);
    onUpdate?.(updatedTask);
    setIsPriorityMenuOpen(false);
  };

  // 8. SAVE EDITED TITLE & DESCRIPTION
  const handleSaveMeta = () => {
    if (!editTitle.trim()) return;

    const updatedTask = {
      ...task,
      title: editTitle.trim(),
      description: editDescription.trim(),
      dueDate: editDueDate || task.dueDate,
      estimatedTime: editEstimatedTime || task.estimatedTime,
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
    setIsEditingMeta(false);
  };

  const handleCancelMeta = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.dueDate || "");
    setEditEstimatedTime(task.estimatedTime || "8h");
    setIsEditingMeta(false);
  };

  // Filter project members for assignee search
  const filteredTeamMembers = effectiveMembers.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    const name = (m.name || "").toLowerCase();
    const username = (m.username || "").toLowerCase();
    const role = (m.role || m.projectRole || "").toLowerCase();
    return name.includes(q) || username.includes(q) || role.includes(q);
  });

  const subtasks = task.subtasks || [];
  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const subtasksProgress =
    subtasks.length > 0
      ? Math.round((completedSubtasksCount / subtasks.length) * 100)
      : 0;

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
              className="inline-flex items-center gap-1.5 focus:outline-none group"
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
                    onClick={() => handleStatusChange(statusVal)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                      task.status === statusVal
                        ? "bg-indigo-50 text-[#4361EE]"
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
              className="inline-flex items-center gap-1.5 focus:outline-none group"
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
                    onClick={() => handlePriorityChange(prioVal)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                      task.priority === prioVal
                        ? "bg-indigo-50 text-[#4361EE]"
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

        {/* Project Name + Edit Toggle Button */}
        <div className="flex items-center gap-3">
          {task.isIndividual || (!task.project && !task.projectId) || task.projectName === "Individual Task" ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span>Self / Individual Task</span>
            </div>
          ) : (
            task.projectName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <FolderKanban size={13} className="text-[#4361EE]" />
                <span>{task.projectName}</span>
              </div>
            )
          )}

          <button
            type="button"
            onClick={() => {
              if (isEditingMeta) {
                handleCancelMeta();
              } else {
                setEditTitle(task.title);
                setEditDescription(task.description || "");
                setEditDueDate(task.dueDate || "");
                setEditEstimatedTime(task.estimatedTime || "8h");
                setIsEditingMeta(true);
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit2 size={12} />
            <span>{isEditingMeta ? "Cancel Edit" : "Edit Info"}</span>
          </button>
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
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
              onClick={handleCancelMeta}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveMeta}
              disabled={!editTitle.trim()}
              className="px-4 py-1.5 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
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
          <span className="font-semibold text-[#4361EE] mt-0.5 block">
            {task.estimatedTime || "8h"}
          </span>
        </div>
      </div>

      {/* TASK CREATOR (Clearly distinguished from assignees) */}
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

      {/* 4. EMPLOYEE / ASSIGNEES SECTION (EDIT & MANAGE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assigned Employees ({task.assignees?.length || 0})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAssigneePickerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4361EE] hover:text-[#3451DE] transition-colors"
          >
            <UserPlus size={13} />
            <span>
              {isAssigneePickerOpen ? "Done Editing" : "+ Edit Assignees"}
            </span>
          </button>
        </div>

        {/* Inline Employee Multi-Select Picker */}
        {isAssigneePickerOpen && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3 animate-in fade-in duration-150">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search employees to assign or remove..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
              />
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200/80">
              {filteredTeamMembers.map((member) => {
                const isAssigned = (task.assignees || []).some(
                  (a) => a.id === member.id,
                );
                return (
                  <div
                    key={member.id}
                    onClick={() => handleToggleAssignee(member)}
                    className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                      isAssigned ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isAssigned
                            ? "bg-[#4361EE] border-[#4361EE] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isAssigned && <Check size={11} strokeWidth={3} />}
                      </div>

                      <Avatar
                        src={member.avatar}
                        name={member.name}
                        size="xs"
                        className="ring-1 ring-slate-100"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {member.role || "Member"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isAssigned
                          ? "bg-indigo-100 text-[#4361EE]"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {isAssigned ? "Assigned" : "+ Add"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Assigned Employees Cards */}
        {task.assignees && task.assignees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {task.assignees.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="sm"
                    className="ring-1 ring-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.role || "Member"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemoveAssignee(user.id, e)}
                  title={`Remove ${user.name}`}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">
              No employees assigned to this task.
            </p>
            <button
              type="button"
              onClick={() => setIsAssigneePickerOpen(true)}
              className="text-xs font-bold text-[#4361EE] hover:underline mt-0.5"
            >
              + Assign employees now
            </button>
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE SUBTASKS CHECKLIST ("subtask ko tick kar sake") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListChecks size={15} className="text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Subtasks ({completedSubtasksCount}/{subtasks.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {subtasks.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-500">
                {subtasksProgress}% complete
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsAddingSubtask((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4361EE] hover:text-[#3451DE] transition-colors"
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
              className="bg-[#4361EE] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${subtasksProgress}%` }}
            />
          </div>
        )}

        {/* Interactive Clickable Checklist */}
        {subtasks.length > 0 ? (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                onClick={() => handleToggleSubtask(sub.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none group ${
                  sub.completed
                    ? "bg-slate-50/80 border-slate-200/60"
                    : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Clickable Tick Box */}
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      sub.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 group-hover:border-[#4361EE] bg-white"
                    }`}
                  >
                    {sub.completed && <Check size={11} strokeWidth={3} />}
                  </div>

                  <span
                    className={`text-xs transition-colors truncate ${
                      sub.completed
                        ? "line-through text-slate-400 font-normal"
                        : "text-slate-800 font-medium group-hover:text-[#4361EE]"
                    }`}
                  >
                    {sub.title}
                  </span>
                </div>

                {/* Delete subtask button */}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSubtask(sub.id, e)}
                  title="Delete subtask"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all ml-2"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
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
            onSubmit={handleAddSubtask}
            className="flex gap-2 pt-1 animate-in fade-in duration-150"
          >
            <input
              type="text"
              autoFocus
              placeholder="Enter new subtask title..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            />
            <button
              type="submit"
              disabled={!newSubtaskTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setNewSubtaskTitle("");
                setIsAddingSubtask(false);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* 6. Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Paperclip size={14} className="text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Attachments ({task.attachments.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {task.attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <FileText size={16} className="text-indigo-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="space-y-1.5">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-[#4361EE] border border-indigo-100"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 8. Handover Note */}
      {task.comment && (
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <MessageSquare size={13} />
            <span>Handover Note</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{task.comment}</p>
        </div>
      )}

      {/* 9. Interactive Comments & @Mentions */}
      <TaskComments
        taskId={task.id || task._id}
        projectMembers={effectiveMembers}
      />
    </div>
  );
};
