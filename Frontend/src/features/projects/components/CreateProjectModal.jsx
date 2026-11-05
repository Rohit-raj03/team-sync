import React from "react";
import { X, FolderPlus, Edit3 } from "lucide-react";
import { ProjectForm } from "./ProjectForm.jsx";

/**
 * Feature Component: CreateProjectModal
 * Layer: features/projects/components/
 * Responsibility: Modal dialog container for creating and editing projects with tagged team members and timeline targets.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl lg:max-w-3xl max-h-[86vh] sm:max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center shrink-0">
              {isEditMode ? <Edit3 size={18} /> : <FolderPlus size={18} />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {isEditMode ? "Edit Project Details" : "Create New Project"}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {isEditMode
                  ? "Update project milestones, contributors, and timeline targets."
                  : "Set milestones, tag contributing team members with their roles, and connect future tasks."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          <ProjectForm
            initialData={initialData || {}}
            mode={isEditMode ? "edit" : "create"}
            onSubmit={async (data) => {
              await onSubmit?.(data);
              onClose?.();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
