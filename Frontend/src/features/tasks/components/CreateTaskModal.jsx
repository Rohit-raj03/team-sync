import React from "react";
import { X, Sparkles } from "lucide-react";
import { CreateTaskForm } from "./CreateTaskForm.jsx";

/**
 * Feature Component: CreateTaskModal
 * Layer: features/tasks/components/
 * Responsibility: Modal dialog container for creating or updating tasks anywhere in the app with backdrop, exit keys, and responsive scrolling.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {title || (isEditMode ? "Update Task" : "Create New Task")}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {subtitle ||
                  (isEditMode
                    ? "Update overall task details, workflow status, assignees, and checklist."
                    : "Add an actionable item to your team's workflow and assign contributors.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <CreateTaskForm
            initialData={initialData}
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
