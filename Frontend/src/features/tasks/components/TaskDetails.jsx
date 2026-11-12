import React, { useState } from "react";
import { useTasks } from "../hooks/useTasks.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { taskService } from "../services/task.service.js";
import { showToast } from "../../../shared/utils/toast.js";
import { useTeam } from "../../team/hooks/useTeam.js";
import { useProjects } from "../../projects/hooks/useProjects.js";
import { TaskComments } from "./TaskComments.jsx";
import { CreateTaskModal } from "./CreateTaskModal.jsx";
import { DeleteTaskModal } from "./DeleteTaskModal.jsx";
import { AttachmentPreviewModal } from "./attachments/AttachmentPreviewModal.jsx";
import { TaskHeaderMeta } from "./task-details/TaskHeaderMeta.jsx";
import { TaskAssigneeSection } from "./task-details/TaskAssigneeSection.jsx";
import { TaskSubtasksSection } from "./task-details/TaskSubtasksSection.jsx";
import { TaskAttachmentsSection } from "./task-details/TaskAttachmentsSection.jsx";
import { TaskMetadataSection } from "./task-details/TaskMetadataSection.jsx";

const getSubtaskId = (sub, idx) => sub?.id || sub?._id || `st-${idx}`;

/**
 * Feature Component: TaskDetails
 * Layer: features/tasks/components/
 * Responsibility: Complete interactive task overview enabling inline subtask ticking, employee/assignee additions and removals, status transitions, metadata editing, @mentions, and real-time discussion comments.
 */
export const TaskDetails = ({
  task: initialTask,
  taskId,
  onUpdate,
  onDelete,
  onClose,
  projectMembers: passedMembers,
}) => {
  const { allTasks, updateTask, deleteTask } = useTasks();
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

  // Attachment preview & deletion state
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [removingAttachmentId, setRemovingAttachmentId] = useState(null);

  // Edit & Delete modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Current authenticated user for RBAC permission enforcement
  const { user: currentUser } = useAuth();
  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const creatorId = (
    task?.creator?._id ||
    task?.creator?.id ||
    task?.creator
  )?.toString();
  const isAdmin = currentUser?.role === "admin";
  const isCreator = Boolean(
    currentUserId && creatorId && currentUserId === creatorId
  );
  const isProjectManager = Boolean(
    project &&
      currentUserId &&
      ((project.manager?._id || project.manager)?.toString() === currentUserId ||
        (project.owner?._id || project.owner)?.toString() === currentUserId ||
        project.canManageProject?.(currentUser?._id, currentUser?.role))
  );
  const isAssignee = (task?.assignees || []).some((a) => {
    const aId = (a?._id || a?.id || a)?.toString();
    return aId === currentUserId;
  });

  const canManageTask = isAdmin || isCreator || isProjectManager;
  const canAttachFiles = canManageTask || isAssignee;

  const canRemoveAttachment = (attachment) => {
    if (canManageTask) return true;
    const uploaderId = (
      attachment.uploadedBy?._id ||
      attachment.uploadedBy?.id ||
      attachment.uploadedBy
    )?.toString();
    return Boolean(uploaderId && currentUserId && uploaderId === currentUserId);
  };

  if (!task) return null;

  // 1. SUBTASK TICKING / TOGGLE
  const handleToggleSubtask = (subtaskId, e) => {
    e?.stopPropagation?.();
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.map((sub, idx) => {
      const sId = getSubtaskId(sub, idx);
      return sId === subtaskId ? { ...sub, completed: !sub.completed } : sub;
    });

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
    };

    updateTask(updatedTask, { silent: true });
    onUpdate?.(updatedTask);
  };

  // 2. ADD SUBTASK
  const handleAddSubtask = (title) => {
    if (!title?.trim()) return;

    const newSubtask = {
      id: `st-${Date.now()}`,
      title: title.trim(),
      completed: false,
    };

    const updatedTask = {
      ...task,
      subtasks: [...(task.subtasks || []), newSubtask],
    };

    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 3. REMOVE SUBTASK
  const handleRemoveSubtask = (subtaskId, e) => {
    e?.stopPropagation?.();
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.filter(
      (s, idx) => getSubtaskId(s, idx) !== subtaskId
    );

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
    };

    updateTask(updatedTask, { silent: true });
    onUpdate?.(updatedTask);
  };

  // 3b. UPDATE SUBTASK TITLE
  const handleUpdateSubtaskTitle = (subtaskId, newTitle, e) => {
    e?.stopPropagation?.();
    if (!newTitle || !newTitle.trim()) return;

    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = currentSubtasks.map((sub, idx) => {
      const sId = getSubtaskId(sub, idx);
      return sId === subtaskId ? { ...sub, title: newTitle.trim() } : sub;
    });

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
    };

    updateTask(updatedTask, { silent: true });
    onUpdate?.(updatedTask);
  };

  // 4. EMPLOYEE / ASSIGNEE EDITING (TOGGLE ASSIGNEE)
  const handleToggleAssignee = (member) => {
    const currentAssignees = task.assignees || [];
    const exists = currentAssignees.some(
      (a) => (a.id || a._id) === (member.id || member._id)
    );

    let updatedAssignees;
    if (exists) {
      updatedAssignees = currentAssignees.filter(
        (a) => (a.id || a._id) !== (member.id || member._id)
      );
    } else {
      updatedAssignees = [
        ...currentAssignees,
        {
          id: member.id || member._id,
          _id: member.id || member._id,
          name: member.name,
          username: member.username,
          role: member.role || member.projectRole,
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
    e?.stopPropagation?.();
    const updatedAssignees = (task.assignees || []).filter(
      (a) => (a.id || a._id) !== memberId
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
  };

  // 7. QUICK PRIORITY CHANGE
  const handlePriorityChange = (newPriority) => {
    const updatedTask = {
      ...task,
      priority: newPriority,
    };
    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 8. SAVE EDITED TITLE & DESCRIPTION
  const handleSaveMeta = (meta) => {
    const updatedTask = {
      ...task,
      ...meta,
    };
    updateTask(updatedTask);
    onUpdate?.(updatedTask);
  };

  // 9. REMOVE ATTACHMENT FROM OVERVIEW
  const handleRemoveTaskAttachment = async (attachment, e) => {
    e?.stopPropagation?.();
    const attId = attachment.fileId || attachment._id || attachment.id;
    if (!attId) return;

    if (!canRemoveAttachment(attachment)) {
      showToast.error("You are not authorized to remove this attachment.");
      return;
    }

    setRemovingAttachmentId(attId);
    try {
      const taskIdVal = task.id || task._id || currentId;
      const res = await taskService.deleteTaskAttachment(taskIdVal, attId);
      const updatedAttachments =
        res?.attachments ||
        (task.attachments || []).filter(
          (a) => (a.fileId || a._id || a.id) !== attId
        );

      const updatedTask = {
        ...task,
        attachments: updatedAttachments,
      };

      updateTask(updatedTask, { silent: true });
      onUpdate?.(updatedTask);
      showToast.attachments.removed();
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      showToast.attachments.removeFailed(err);
    } finally {
      setRemovingAttachmentId(null);
    }
  };

  // 10. REAL-TIME ATTACHMENT SYNC
  const handleAttachmentsChange = (newAttachments) => {
    const updatedTask = {
      ...task,
      attachments: newAttachments,
    };
    updateTask(updatedTask, { silent: true });
    onUpdate?.(updatedTask);
  };

  // 11. TASK DELETION CONFIRMATION
  const handleDeleteConfirm = async (reason) => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const idToDelete = task.id || task._id || currentId;
      await deleteTask(idToDelete, reason);
      setIsDeleteModalOpen(false);
      onDelete?.(idToDelete);
      onClose?.();
    } catch (err) {
      console.error("Task deletion failed:", err);
      setDeleteError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete task. You may not have permission to delete this task."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Status, Priority, Edit, Delete, Title, Description, Dates & Creator */}
      <TaskHeaderMeta
        task={task}
        effectiveMembers={effectiveMembers}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onSaveMeta={handleSaveMeta}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onOpenDeleteModal={() => {
          setDeleteError("");
          setIsDeleteModalOpen(true);
        }}
      />

      {/* 2. Employee / Assignees Section */}
      <TaskAssigneeSection
        assignees={task.assignees || []}
        effectiveMembers={effectiveMembers}
        onToggleAssignee={handleToggleAssignee}
        onRemoveAssignee={handleRemoveAssignee}
      />

      {/* 3. Subtasks Checklist */}
      <TaskSubtasksSection
        subtasks={task.subtasks || []}
        onToggleSubtask={handleToggleSubtask}
        onAddSubtask={handleAddSubtask}
        onRemoveSubtask={handleRemoveSubtask}
        onUpdateSubtaskTitle={handleUpdateSubtaskTitle}
      />

      {/* 4. Attachments Section */}
      <TaskAttachmentsSection
        taskId={task.id || task._id || currentId}
        attachments={task.attachments || []}
        canAttachFiles={canAttachFiles}
        canRemoveAttachment={canRemoveAttachment}
        onAttachmentsChange={handleAttachmentsChange}
        onRemoveAttachment={handleRemoveTaskAttachment}
        onPreview={setPreviewModalUrl}
        removingAttachmentId={removingAttachmentId}
      />

      {/* 5. Metadata (Tags & Handover Notes) */}
      <TaskMetadataSection
        tags={task.tags || []}
        project={project}
        taskProject={task.project}
        comment={task.comment}
      />

      {/* 6. Comments & Discussion Stream */}
      <TaskComments
        taskId={task.id || task._id || currentId}
        projectMembers={effectiveMembers}
      />

      {/* 7. Comprehensive Update Task Modal */}
      <CreateTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          ...task,
          id: task.id || task._id,
          _id: task._id || task.id,
          projectId: task.projectId || task.project?._id || task.project || "",
        }}
        title="Update Task"
        subtitle="Update overall task details, workflow status, assignees, and checklist."
        onSubmit={async (data) => {
          const updated = {
            ...task,
            ...data,
            id: task.id || task._id,
            _id: task._id || task.id,
          };
          const res = await updateTask(updated);
          onUpdate?.(res || updated);
          setIsEditModalOpen(false);
        }}
      />

      {/* 8. Delete Task Confirmation Modal */}
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setDeleteError("");
          }
        }}
        onConfirm={handleDeleteConfirm}
        taskTitle={task.title}
        isDeleting={isDeleting}
        apiError={deleteError}
      />

      {/* 9. Lightbox Modal for Image Attachment Previews */}
      <AttachmentPreviewModal
        previewUrl={previewModalUrl}
        onClose={() => setPreviewModalUrl(null)}
      />
    </div>
  );
};

export default TaskDetails;
