import React from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal.jsx";
import { CreateTaskForm } from "./CreateTaskForm.jsx";

/**
 * Feature Component: CreateTaskModal
 * Layer: features/tasks/components/
 * Responsibility: Modal dialog container for creating or updating tasks anywhere in the app with backdrop, exit keys, and responsive scrolling.
 * Wraps canonical Modal.
 */
export const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title,
  subtitle,
}) => {
  if (!isOpen) return null;
  const isEditMode = Boolean(initialData.id || initialData._id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={title || (isEditMode ? "Update Task" : "Create New Task")}
      subtitle={
        subtitle ||
        (isEditMode
          ? "Update overall task details, workflow status, assignees, and checklist."
          : "Add an actionable item to your team's workflow and assign contributors.")
      }
      bodyClassName="p-6 overflow-y-auto"
      icon={
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
          <Sparkles size={18} />
        </div>
      }
    >
      <CreateTaskForm
        initialData={initialData}
        mode={isEditMode ? "edit" : "create"}
        onSubmit={async (data) => {
          await onSubmit?.(data);
          onClose?.();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default CreateTaskModal;
