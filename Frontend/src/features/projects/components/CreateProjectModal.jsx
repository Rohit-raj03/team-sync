import React from "react";
import { X, FolderPlus, Edit3 } from "lucide-react";
import { ProjectForm } from "./ProjectForm.jsx";

/**
 * Feature Component: CreateProjectModal
 * Layer: features/projects/components/
 * Responsibility: Modal dialog container for creating and editing projects with sticky header/footer and scrollable body.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl lg:max-w-3xl max-h-[85vh] h-full sm:h-auto flex flex-col rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Fixed Header (flex-shrink: 0) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-50 text-[#4361EE] flex items-center justify-center shrink-0">
              {isEditMode ? <Edit3 size={19} /> : <FolderPlus size={19} />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {isEditMode ? "Edit Project Details" : "Create New Project"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isEditMode
                  ? "Update project milestones, contributors, and timeline targets."
                  : "Set up your project workspace and configure team members."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form component containing independently scrollable middle body and fixed action footer */}
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
  );
};

export default CreateProjectModal;
