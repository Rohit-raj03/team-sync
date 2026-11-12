import React from "react";
import { FolderPlus, Edit3 } from "lucide-react";
import { Modal } from "../../../shared/components/ui/Modal.jsx";
import { ProjectForm } from "./ProjectForm.jsx";

/**
 * Feature Component: CreateProjectModal
 * Layer: features/projects/components/
 * Responsibility: Modal dialog container for creating and editing projects with sticky header/footer and scrollable body.
 * Wraps canonical Modal.
 */
export const CreateProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
}) => {
  if (!isOpen) return null;

  const isEditMode =
    mode === "edit" || Boolean(initialData?.id || initialData?._id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl lg:max-w-3xl"
      title={isEditMode ? "Edit Project Details" : "Create New Project"}
      subtitle={
        isEditMode
          ? "Update project milestones, contributors, and timeline targets."
          : "Set up your project workspace and configure team members."
      }
      bodyClassName="p-0 overflow-hidden flex flex-col"
      icon={
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
          {isEditMode ? <Edit3 size={19} /> : <FolderPlus size={19} />}
        </div>
      }
    >
      <ProjectForm
        initialData={initialData || {}}
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

export default CreateProjectModal;
